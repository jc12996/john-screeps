import { RepairUtils } from "utils/RepairUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Tower {

    public static defendMyRoom(room:Room) {


        let capacityAvailableThreshold = 800;
        const level = (room.controller?.my && room.controller.level) ? room.controller.level : 1;

        if(level >= 6) {
            capacityAvailableThreshold = 1200;
        }

        if(level >= 7) {
            capacityAvailableThreshold = 3500;
        }

        const extensionFillThresholdPercentage =  (room.energyAvailable >= capacityAvailableThreshold || (level < 3)) ? 1 : .1;

        var hostileCreeps = room.find(FIND_HOSTILE_CREEPS,
            {
                filter: hostileCreep => {
                    return ((hostileCreep.owner &&
                     !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)) || hostileCreep?.owner?.username === 'Invader')
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
                return structure.structureType === STRUCTURE_CONTAINER && structure.hits < (RepairUtils.buildingRatios(structure).maxContainerStrength)
            }
        });

        const ramparts = room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return structure.structureType === STRUCTURE_RAMPART && structure.hits < 1000
            }
        });


        // towers.forEach(tower => {
        //     tower.room?.createConstructionSite(tower.pos.x,tower.pos.y,STRUCTURE_RAMPART);
        // });


        if(hostileCreeps.length > 0 && room.controller?.my && !room.controller.safeMode) {
            var username = hostileCreeps[0].owner.username;
            console.log(hostileCreeps[0].name)
            Game.notify(`User ${username} spotted in room ${room.name}`);
            towers.forEach(tower => {
                const room = tower.room;

                // Find all hostile creeps in the room
                const hostileCreeps = room.find(FIND_HOSTILE_CREEPS);

                if (hostileCreeps.length > 0 || hostileCreeps[0].owner.username === 'Invader') {
                    // Separate healers from attackers
                    const healers = hostileCreeps.filter(creep => creep.getActiveBodyparts(HEAL) > 0);
                    const attackers = hostileCreeps.filter(creep => creep.getActiveBodyparts(ATTACK) > 0);
                    const dismantlers = hostileCreeps.filter(creep => creep.getActiveBodyparts(WORK) > 0);

                    // Sort healers and attackers by their distance from the tower
                    healers.sort((a, b) => tower.pos.getRangeTo(a) - tower.pos.getRangeTo(b));
                    attackers.sort((a, b) => tower.pos.getRangeTo(a) - tower.pos.getRangeTo(b));

                    // Prioritize healers if they are within the tower's effective range
                    /**if (healers.length > 0) {
                        const closestHealer = healers[0];
                        const rangeToHealer = tower.pos.getRangeTo(closestHealer);

                        // Check if the healer is within the tower's range (30 units)
                        if (rangeToHealer <= 30) {
                            tower.attack(closestHealer);
                        } else {
                            // Optional: Handle healers that are out of range
                            console.log(`Healers are out of range: ${closestHealer.name} (${rangeToHealer} units away)`);
                        }
                    } else
                     */
                     if (attackers.length > 0) {
                        // If no healers, attack the closest attacker
                        const closestAttacker = attackers[0];
                        tower.attack(closestAttacker);
                    } else if (dismantlers.length > 0) {
                        // If no healers, attack the closest attacker
                        const dismantler = dismantlers[0];
                        tower.attack(dismantler);
                    } else if(hostileCreeps[0].owner.username === 'Invader') {
                        tower.attack(hostileCreeps[0])
                    } else {
                        tower.attack(attackers[0])
                    }
                }
            });
            console.log(room.name,"ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ALERT!!!! WE ARE UNDER ATTACK!!!!! ");
            return;
        }else if(friendlies.length > 0) {
            towers.forEach(tower => tower.heal(friendlies[0]));
            console.log("Tower is healing Creeps.");
        } else if(containers.length > 0 ) {
            // Find the container with the lowest health
            const weakestContainer = containers.reduce((weakest, container) => {
                return (container.hits < weakest.hits) ? container : weakest;
            });
            towers.forEach(tower => tower.repair(weakestContainer));
        }
        else if(ramparts.length > 0 && room.controller?.my) {
            // Find the rampart with the lowest health
            const weakestRampart = ramparts.reduce((weakest, rampart) => {
                return (rampart.hits < weakest.hits) ? rampart : weakest;
            });
            towers.forEach(tower => tower.repair(weakestRampart));
        }
        else if(roads.length > 0 ) {
            // Find the road with the lowest health
            const weakestRoad = roads.reduce((weakest, road) => {
                return (road.hits < weakest.hits) ? road : weakest;
             });
            towers.forEach(tower => tower.repair(weakestRoad));
        }
    }
}
