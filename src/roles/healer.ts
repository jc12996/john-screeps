import { MovementUtils } from "utils/MovementUtils";

export class Healer {


    private static healTarget(creeps: any, creep: Creep, target: any) {
        if(target && creep.room.controller !== target) {
            creep.moveTo(target);
            const healResult = creep.heal(target)
            if(healResult == ERR_NOT_IN_RANGE) {
                creep.moveTo(creeps[0], {visualizePathStyle: {stroke: '#ff0000'}});
            }
        }
    }

    public static run(creep: Creep): void {

        creep.say('🏥');

        var friendlyHurtCreeps = creep.room.find(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax && (object.memory.role === 'healer' || object.memory.role === 'dismantler' || object.memory.role === 'attacker');
            }
        });

        if(friendlyHurtCreeps.length > 0) {

            creep.say('heal!!');
            const myHurtCreeps = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(object) {
                    return object.hits < object.hitsMax && (object.memory.role === 'healer' || object.memory.role === 'dismantler' || object.memory.role === 'attacker');
                }
            });


            Healer.healTarget(friendlyHurtCreeps,creep,myHurtCreeps);


        } else {

            const friendlyCreeps = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
                filter: function(object) {
                    return ((object.memory.role === 'dismantler' || object.memory.role === 'attacker' || object.memory.role === 'healer') && object.hits < object.hitsMax);
                }
            });


            if(Game.flags?.attackFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.attackFlag);
            } else if(Game.flags?.rallyFlag) {
                MovementUtils.defaultArmyMovement(creep,Game.flags?.rallyFlag);
            }  else {
                MovementUtils.defaultArmyMovement(creep,undefined);
            }

        }
    }
}

