import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Healer {


    private static healTarget( creep: Creep, target: 'me' | 'ally') {
         // Check for self-healing
         if (creep.hits < creep.hitsMax) {
            // If the creep's health is below 50%, attempt to self-heal first
            if (creep.getActiveBodyparts(HEAL) > 0 && creep.hits < creep.hitsMax * 0.5) {
                // Perform self-healing if it's damaged
                creep.rangedHeal(creep);
                return;
            }
        }

        // Find all friendly creeps in the room

        let friendlyCreeps = creep.room.find(FIND_MY_CREEPS);

        if(target == 'ally') {
            friendlyCreeps = creep.room.find(FIND_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax &&  object.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(object.owner);
                }
            });
        }



        // Sort friendly creeps by their current health status (lowest health first)
        const injuredCreeps = friendlyCreeps.filter(c => c.hits < c.hitsMax);
        injuredCreeps.sort((a, b) => a.hits / a.hitsMax - b.hits / b.hitsMax);

        if (injuredCreeps.length > 0) {
            // Attempt to heal the most injured friendly creep
            const targetCreep = injuredCreeps[0];

            // Check if the healer has the RANGED_HEAL body part
            if (creep.getActiveBodyparts(HEAL) > 0) {
                // Perform ranged healing if necessary
                if (creep.pos.getRangeTo(targetCreep) > 3) { // If the target is out of melee range
                    creep.rangedHeal(targetCreep);
                } else {
                    // Heal the target creep in melee range
                    creep.heal(targetCreep);
                }
            } else if (creep.getActiveBodyparts(HEAL) > 0) {
                // If only melee healing is available
                if (creep.pos.getRangeTo(targetCreep) <= 1) { // Only heal if within melee range
                    creep.heal(targetCreep);
                }
            }
        }
    }

    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('🏥',false);
        }

        const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
        if(!canProceed){
            return;
        }


        const allyHurtCreeps = creep.room.find(FIND_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax &&  object.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(object.owner);
            }
        });

        let friendlyHurtCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax && object.name !== creep.name
            }
        });


        if(friendlyHurtCreeps.length > 0) {

            creep.say('🏥 M',true);
            Healer.healTarget(creep,'me');


        } else if(allyHurtCreeps.length > 0) {
            creep.say('🏥 A',true);

            Healer.healTarget(creep,'ally');
        } else {

            const friendlyCreeps = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(object) {
                    return ((object.memory.role === 'dismantler' || object.memory.role === 'attacker'));
                }
            });

            var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
                filter:  (creep) => {
                    return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
                }
            });

            if(Game.flags?.healMeatFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.healMeatFlag);
                return;
            }

            if(friendlyCreeps && hostileCreeps) {
                creep.moveTo(friendlyCreeps);
                return;
            }
            if(Game.flags?.healFlag && !friendlyCreeps) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.healFlag);
                return;
            }


            if(friendlyCreeps && !!Game.flags?.attackFlag) {
                creep.moveTo(friendlyCreeps)
                return;
            }

            if(Game.flags?.attackFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
                return;
            }

            if(!!Game.flags?.rallyFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);
                return;
            }

            MovementUtils.defaultArmyMovement(creep,undefined);


        }
    }
}

