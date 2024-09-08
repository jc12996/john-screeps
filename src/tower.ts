import { RepairUtils } from "utils/RepairUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Tower {

    public static defendMyRoom(room:Room) {


        let capacityAvailableThreshold = 800;
        const level = (room.controller?.my && room.controller.level) ? room.controller.level : 1;

        if(level >= 6) {
            capacityAvailableThreshold = 1200;
        }

        const extensionFillThresholdPercentage =  (room.energyAvailable >= capacityAvailableThreshold || (level < 3)) ? 1 : .1;

        var hostiles = room.find(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner) && hostileCreep.getActiveBodyparts(ATTACK) > 0) || hostileCreep?.owner?.username === 'Invader')
                  }
            }
        );

        const towers: Array<StructureTower> = room.find(FIND_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER
        })

        var friendlies = room.find(FIND_MY_CREEPS, {
            filter:  (creep) => {
                return creep.hits !== creep.hitsMax
            }
        });

        const roads = room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_ROAD && structure.hits < (RepairUtils.buildingRatios(structure).maxRoadStrength * extensionFillThresholdPercentage)
            }
        });

        const containers = room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_CONTAINER && structure.hits < (RepairUtils.buildingRatios(structure).maxContainerStrength * extensionFillThresholdPercentage)
            }
        });

        const ramparts = room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_RAMPART && structure.hits < (RepairUtils.buildingRatios(structure).maxRampartStrength * extensionFillThresholdPercentage)
            }
        });

        const walls = room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_WALL && structure.hits < (RepairUtils.buildingRatios(structure).maxWallStrength * extensionFillThresholdPercentage)
            }
        });

        // towers.forEach(tower => {
        //     tower.room?.createConstructionSite(tower.pos.x,tower.pos.y,STRUCTURE_RAMPART);
        // });


        if(hostiles.length > 0) {
            var username = hostiles[0].owner.username;
            console.log(hostiles[0].name)
            Game.notify(`User ${username} spotted in room ${room.name}`);
            towers.forEach(tower => {
                const towerCode = tower.attack(hostiles[0]);
                console.log('tower attack code: ',towerCode)
            });
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
        } else if(walls.length > 0 ) {
            towers.forEach(tower => tower.repair(walls[0]));
        }
    }
}
