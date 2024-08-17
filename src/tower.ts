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
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)
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
                return structure.structureType === STRUCTURE_ROAD && structure.hits < 1000
            }
        });

        const containers = rooms.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.hits < 1000
            }
        });

        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            Game.notify(`User ${username} spotted in room ${myRoomName}`);
            towers.forEach(tower => tower.attack(hostiles[0]));
            console.log("ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
        }else if(friendlies.length > 0) {
            towers.forEach(tower => tower.heal(friendlies[0]));
            console.log("Tower is healing Creeps.");
        } else if(containers.length > 0 ) {
            towers.forEach(tower => tower.repair(containers[0]));
        } else if(roads.length > 0 ) {
            towers.forEach(tower => tower.repair(roads[0]));
        }
    }
}
