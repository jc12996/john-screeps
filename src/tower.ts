import { RepairUtils } from "utils/RepairUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Tower {

    public static defendMyRoom(myRoomName:string) {

        const rooms = Game.rooms[myRoomName];
        if(!rooms) {
            return;
        }
        var hostiles = rooms.find(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner) && hostileCreep.getActiveBodyparts(ATTACK) > 0
                  }
            }
        );

        let structureTowers = _.filter(Game.structures, (structure) => structure.structureType == STRUCTURE_TOWER);
        let towers:Array<StructureTower> = [];
        structureTowers.forEach((tower) => {
            const myTower: StructureTower = tower as StructureTower;
            towers.push(myTower);
        })
        var friendlies = rooms.find(FIND_MY_CREEPS, {
            filter:  (creep) => {
                return creep.hits !== creep.hitsMax
            }
        });

        const roads = rooms.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_ROAD && structure.hits < 500
            }
        });

        const containers = rooms.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.hits < (RepairUtils.buildingRatios(structure).maxContainerStrength * .1)
            }
        });

        const ramparts = rooms.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_RAMPART && structure.hits < (RepairUtils.buildingRatios(structure).maxRampartStrength * .1)
            }
        });

        // towers.forEach(tower => {
        //     tower.room?.createConstructionSite(tower.pos.x,tower.pos.y,STRUCTURE_RAMPART);
        // });


        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${myRoomName}`);
            towers.forEach(tower => tower.attack(hostiles[0]));
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
            return;
        }else if(friendlies.length > 0) {
            towers.forEach(tower => tower.heal(friendlies[0]));
            console.log("Tower is healing Creeps.");
        } else if(containers.length > 0 ) {
            towers.forEach(tower => tower.repair(containers[0]));
        } else if(ramparts.length > 0) {
            towers.forEach(tower => tower.repair(ramparts[0]));
        } else if(roads.length > 0 ) {
            towers.forEach(tower => tower.repair(roads[0]));
        }
    }
}
