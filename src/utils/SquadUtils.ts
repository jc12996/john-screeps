import { SpawnUtils } from "./SpawnUtils";

export class SquadUtils {
    public static squadSize = 4; // 3x3 formation (1 lead healer, 4 attackers, 4 healers)

    // Directions for each squad position relative to the lead creep
    public static formationOffsets: Array<{ x: number, y: number }> = [
        { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 },  // First row
        { x: -1, y: 0 },  { x: 0, y: 0 },  { x: 1, y: 0 },   // Second row (lead is at center)
        { x: -1, y: 1 },  { x: 0, y: 1 },  { x: 1, y: 1 }    // Third row
    ];

    // Determine if a room position is walkable (not a wall, rampart, etc.)
    public static isWalkable = function (pos:RoomPosition): boolean {
        const terrain = Game.map.getRoomTerrain(pos.roomName);
        const terrainType = terrain.get(pos.x, pos.y);

        if (terrainType === TERRAIN_MASK_WALL) {
            return false; // Wall is not walkable
        }

        const structures = pos.lookFor(LOOK_STRUCTURES);
        for (const structure of structures) {
            if (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) {
                return false;
            }
        }
        return true;
    };

    // Function to prioritize targets in the correct order (post-breach)
    public static getPriorityTarget(creep: Creep): Structure | Creep | null {
        // 1. Hostile towers
        const towers = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) => structure.structureType === STRUCTURE_TOWER && structure.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(structure.owner)
        });

        if (towers.length > 0) {
            // Attack rampart if protecting the tower
            const rampartedTowers = towers.filter(tower => {
                const ramparts = tower.pos.lookFor(LOOK_STRUCTURES);
                return ramparts.some(s => s.structureType === STRUCTURE_RAMPART) &&  creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner);
            });

            if (rampartedTowers.length > 0) {
                const rampart = rampartedTowers[0].pos.lookFor(LOOK_STRUCTURES).find(s => s.structureType === STRUCTURE_RAMPART);
                return rampart ? rampart : rampartedTowers[0];
            }

            return towers[0];
        }

        // 2. Hostile creeps
        const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS);
        if (hostileCreeps.length > 0) {
            return creep.pos.findClosestByRange(hostileCreeps);
        }

        // 3. Spawns, Extensions, and other economic structures
        const importantStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
            filter: (structure) =>
                (structure.structureType === STRUCTURE_SPAWN ||
                structure.structureType === STRUCTURE_EXTENSION ||
                structure.structureType === STRUCTURE_STORAGE ||
                structure.structureType === STRUCTURE_TERMINAL ||
                structure.structureType === STRUCTURE_LAB) &&
                structure.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(structure.owner)
        });

        if (importantStructures.length > 0) {
            return creep.pos.findClosestByRange(importantStructures);
        }

        // 4. Ignore walls, ramparts (except for ramparted structures), and roads
        const allStructures = creep.room.find(FIND_STRUCTURES, {
            filter: (structure) => (
                structure.structureType !== STRUCTURE_WALL &&
                structure.structureType !== STRUCTURE_RAMPART &&
                structure.structureType !== STRUCTURE_ROAD &&
                structure.room.controller?.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(structure.room.controller?.owner)
            )
        });

        if (allStructures.length > 0) {
            return creep.pos.findClosestByRange(allStructures);
        }

        return null;
    }

    // Function to assign creeps to formation and handle attacking/healing
    public static assignSquadFormationAndCombat(squad: Creep[], leadHealer: Creep, flag: Flag): void {
        // Find the breached position (if a wall or rampart has been destroyed)
        const breachPosition = leadHealer.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure =>
            (structure.structureType === STRUCTURE_WALL || structure.structureType === STRUCTURE_RAMPART) &&
            structure.hits === 0 // Checking for the breached (destroyed) structure
        })?.pos ?? null;

        // Ensure the squad size is 9
        if (squad.length  < this.squadSize) {
            console.log('Squad does not have enough creeps!');
            return;
        }


        const damagedSquadMembers = squad.filter(creep => creep.hits < creep.hitsMax);
        let isBreachComplete = breachPosition && this.isWalkable(breachPosition);
        if(leadHealer.room.controller && leadHealer.room.controller.my) {
            isBreachComplete = true;
        }


        for (let i = 0; i < squad.length; i++) {
            const creep = squad[i];
            const offset = this.formationOffsets[i];

            const keepersLairs = creep.room.find(FIND_STRUCTURES, {
                filter: function(structure) {
                    return structure.structureType === STRUCTURE_KEEPER_LAIR;
                }
                }) as StructureKeeperLair[];

            if(keepersLairs.length && creep.room === flag.room) {
                const mostClosestSpawningKeepersLairs = keepersLairs.filter((lair)=> {
                    return lair.ticksToSpawn && lair.ticksToSpawn < 60
                });

                if(mostClosestSpawningKeepersLairs.length > 0) {
                    Game.flags.SquadFlag.setPosition(mostClosestSpawningKeepersLairs[0].pos);
                }

                if(keepersLairs.length >= 4 && Game.flags[creep.room.name+'KeeperMine']) {
                    const keepers = creep.room.find(FIND_HOSTILE_CREEPS);
                    if(keepers.length < keepersLairs.length) {
                        Game.flags[creep.room.name+'MineFlag'].setPosition(keepersLairs[0].pos);
                    } else if(Game.flags[creep.room.name+'MineFlag']) {
                        Game.flags[creep.room.name+'MineFlag'].remove();
                    }
                }

            }

            if(leadHealer && leadHealer === creep && leadHealer.room !== Game.flags.SquadFlag.room){
                leadHealer.moveTo(Game.flags.SquadFlag, { visualizePathStyle: { stroke: '#ffffff' } });
                continue;
            }

            if(creep !== leadHealer && creep.room !== leadHealer.room) {
                creep.moveTo(Game.flags.SquadFlag, { visualizePathStyle: { stroke: '#ffffff' } });
                continue;
            }

            if(creep !== leadHealer && creep.room !== leadHealer.room){
                creep.moveTo(Game.flags.SquadFlag, { visualizePathStyle: { stroke: '#ffffff' } });
                continue;
            }


            if(!leadHealer || !leadHealer?.pos || offset?.x ===undefined){
                creep.moveTo(Game.flags.SquadFlag)
                continue;
            }

            const targetPosition = new RoomPosition(
                leadHealer.pos.x + offset.x,
                leadHealer.pos.y + offset.y,
                leadHealer.room.name
            );

            if(creep === leadHealer){
                creep.say('❤',false);
            }




            // Post-breach logic: prioritize towers and hostile creeps
            const target = this.getPriorityTarget(leadHealer);

            if (creep.memory.role === 'attacker') {


                creep.say('⚔');
                if(creep.room !== leadHealer.room){
                    creep.moveTo(Game.flags.SquadFlag, { visualizePathStyle: { stroke: '#ffffff' } });
                    continue;
                }



                if (target  && Game.flags.attackFlag && creep.room === Game.flags.attackFlag.room) {
                    if(!creep.pos.inRangeTo(leadHealer.pos, 1) && creep.hits < (creep.hitsMax * .75)) {
                        creep.moveTo(leadHealer);
                        continue;
                    }

                    if (creep.pos.inRangeTo(target, 1)) {
                        creep.attack(target);
                    } else {
                        creep.moveTo(target, { visualizePathStyle: { stroke: '#ff0000' } });
                    }
                    continue;
                } else {
                    // Move to formation if no target
                    creep.moveTo(targetPosition, { visualizePathStyle: { stroke: '#ffffff' } });

                }
            }else  if (creep.memory.role === 'healer') {
                if(creep.memory.leadHealer) {
                    creep.say('❤',false);
                } else {
                    creep.say('🏥',false);
                    if(creep.room !== leadHealer.room){
                        creep.moveTo(Game.flags.SquadFlag, { visualizePathStyle: { stroke: '#ffffff' } });
                        continue;
                    }

                }
                if (damagedSquadMembers.length > 0) {
                    // Heal the most damaged squad member
                    const mostDamaged = creep.pos.findClosestByRange(damagedSquadMembers);
                    if(!mostDamaged) {
                        creep.moveTo(targetPosition);
                        return;
                    }
                    if (creep.pos.inRangeTo(mostDamaged, 1)) {
                        creep.heal(mostDamaged);
                    } else {
                        creep.moveTo(mostDamaged, { visualizePathStyle: { stroke: '#00ff00' } });
                    }
                } else if(creep !== leadHealer) {
                    // Move to formation if no target
                    creep.moveTo(targetPosition, { visualizePathStyle: { stroke: '#ffffff' } });

                } else if (creep === leadHealer && !leadHealer.pos.inRangeTo(flag.pos, 1)) { // Move the lead healer toward the flag

                    // Lead healer should heal if anyone is damaged
                    if (damagedSquadMembers.length > 0) {
                        const mostDamaged = leadHealer.pos.findClosestByRange(damagedSquadMembers);
                        if(!mostDamaged) {
                            leadHealer.moveTo(flag, { visualizePathStyle: { stroke: '#00ff00' } });
                            return;
                        }
                        if (leadHealer.pos.inRangeTo(mostDamaged, 1)) {
                            leadHealer.say('❤',false);
                            leadHealer.heal(mostDamaged);
                        } else {
                            leadHealer.say('❤',false);
                            leadHealer.rangedHeal(mostDamaged);
                        }
                    }else {
                        leadHealer.moveTo(flag, { visualizePathStyle: { stroke: '#00ff00' } });
                    }
                }
            } else if(!target) {
                creep.moveTo(targetPosition, { visualizePathStyle: { stroke: '#ffffff' } });
            } else {
                // Move to formation if no target
                creep.moveTo(targetPosition, { visualizePathStyle: { stroke: '#ffffff' } });

            }

        }


    }
}
