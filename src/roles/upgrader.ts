import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";

export class Upgrader {
    public static run(creep: Creep): void {


        if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
            creep.say('⚡');
        }

        if(creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
            creep.memory.upgrading = false;
            creep.say('🔄 harvest');
        }
        if(!creep.memory.upgrading && (creep.store.getFreeCapacity() == 0 || (creep.memory.mainUpgrader && creep.store[RESOURCE_ENERGY] > 0) || creep.store[RESOURCE_ENERGY] > 200)) {
            creep.memory.upgrading = true;
            creep.say('⚡ upgrade');
        }

        const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
            filter: (flag) => {
                return (flag.color == COLOR_BLUE) && flag.room?.controller?.my
            }
           })

        const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my


                )
            }
        });

        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn?.room.name);
        var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });

        const highVolumeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store[RESOURCE_ENERGY] > 800;
            }
        });

        if(upgraders.length > 0 && upgraders[0] &&  creep.name === upgraders[0].name && creep.room.controller && creep.room.controller.my && creep.room.controller.level >= 7 && !hostileCreeps && highVolumeStorage) {
            creep.memory.mainUpgrader = true;
        }  else {
            creep.memory.mainUpgrader = false;
        }



        if(creep.memory.upgrading) {
            if(creep.room.controller && creep.room.controller.my &&
                creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            } else if(roomRallyPointFlag.length) {
                creep.moveTo(roomRallyPointFlag[0])
            }
        }
        else  {

            if(creep.memory.mainUpgrader &&  creep.room?.controller  && creep.room?.controller.my) {
                const controllerLinkFlag = Game.flags[creep.room.name+'ControllerLink1'];
                const controllerLink = getLinkByTag(creep,'ControllerLink1');
                if(creep.memory.role === 'upgrader' && creep.room?.controller?.level >= 6 && controllerLinkFlag) {
                    creep.say("⚡💪");
                    MovementUtils.strongUpgraderSequence(creep,controllerLink);
                    return;
                }

            }

            MovementUtils.generalGatherMovement(creep);

         }
    }
}
