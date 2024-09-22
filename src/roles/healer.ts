import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Healer {


    private static healTarget(creeps: any, creep: Creep, target: any) {
        if(target && creep.room.controller !== target) {
            creep.moveTo(target);
            const healResult = creep.heal(target)
            if(healResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(creeps[0], {visualizePathStyle: {stroke: '#008000'}});
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


        var friendlyHurtCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax && (object.memory.role === 'healer' || object.memory.role === 'dismantler' || object.memory.role === 'attacker');
            }
        });

        var allyHurtCreeps = creep.room.find(FIND_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax &&  object.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(object.owner);
            }
        });

        if(friendlyHurtCreeps.length > 0) {

            creep.say('🏥 M',true);
            const myHurtCreeps = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax && (object.memory.role === 'healer' || object.memory.role === 'dismantler' || object.memory.role === 'attacker');
                }
            });


            Healer.healTarget(friendlyHurtCreeps,creep,myHurtCreeps);


        } else if(allyHurtCreeps.length > 0) {
            creep.say('🏥 A',true);

            const myAllyHurtCreeps = creep.pos.findClosestByPath(FIND_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax &&  object.owner && SpawnUtils.FRIENDLY_OWNERS_FILTER(object.owner);
                }
            });


            Healer.healTarget(friendlyHurtCreeps,creep,myAllyHurtCreeps);
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
            }
            else if(Game.flags?.healFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.healFlag);
            }
            else if(friendlyCreeps && Game.flags?.attackFlag) {
                creep.moveTo(friendlyCreeps)
            }
            else if(Game.flags?.attackFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
            } else if(Game.flags?.rallyFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.rallyFlag);
            }  else {
                MovementUtils.defaultArmyMovement(creep,undefined);
            }

        }
    }
}

