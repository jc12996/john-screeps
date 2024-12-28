import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Carrier } from "./carrier";
import { Builder } from "./builder";
import { Labs } from "labs";
import { RoomUtils } from "utils/RoomUtils";

export class Upgrader {
  public static run(creep: Creep): void {
    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("⚡");
    }

    const canContinue = MovementUtils.returnHomeCheck(creep);
    if (!canContinue) {
      return;
    }

    if (!creep.memory.isBoosted) {
      const canContinue = Labs.boostCreep(creep);
      if (!canContinue) {
        return;
      }
    }

    if (creep.memory.upgrading && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.upgrading = false;
      creep.say("🔄 harvest");
    }
    if (
      !creep.memory.upgrading &&
      (creep.store.getFreeCapacity() == 0 ||
        creep.store[RESOURCE_ENERGY] > 0 ||
        (creep.memory.mainUpgrader && creep.store[RESOURCE_ENERGY] > 0) ||
        creep.store[RESOURCE_ENERGY] > 50)
    ) {
      creep.memory.upgrading = true;
      creep.say("⚡ upgrade");
    }

    const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
      filter: flag => {
        return flag.color == COLOR_BLUE && flag.room?.controller?.my;
      }
    });

    const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my;
      }
    });

    const droppedSources =
      creep.pos.findInRange(FIND_DROPPED_RESOURCES, 1, {
        filter: source => {
          return source.amount >= 50 && source.room?.controller?.my && source.resourceType === RESOURCE_ENERGY;
        }
      })[0] ?? null;

    if (creep.store.getFreeCapacity() > 0 && droppedSources) {
      creep.pickup(droppedSources);
    }

    let upgraders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "upgrader" && creep.room.name == spawn?.room.name
    );
    if (upgraders[0] !== creep && creep.room.controller?.level == 8) {
      Carrier.run(creep);
      return;
    }
    var hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
      filter: creep => {
        return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner);
      }
    });

    const highVolumeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_STORAGE &&
          structure.room?.controller?.my &&
          structure.store[RESOURCE_ENERGY] > 800
        );
      }
    });

    const sites = creep.room.find(FIND_CONSTRUCTION_SITES, {
      filter: site => {
        return (
          site.structureType !== STRUCTURE_ROAD &&
          site.structureType !== STRUCTURE_RAMPART &&
          site.structureType !== STRUCTURE_CONTAINER &&
          site.structureType !== STRUCTURE_WALL
        );
      }
    });

    const constructSpawn = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
      filter: site => {
        return site.structureType == STRUCTURE_SPAWN || site.structureType == STRUCTURE_TOWER;
      }
    });

    if (
      creep.room.controller?.my &&
      creep.room.controller.sign?.username &&
      creep.room.controller.sign?.username !== "Xarroc"
    ) {
      if (
        creep.room.controller &&
        creep.room.controller.my &&
        creep.signController(creep.room.controller, "This is mine") == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#FF0000" } });
      }
      return;
    }

    const controllerLink = getLinkByTag(creep, "ControllerLink1");
    if (
      controllerLink &&
      upgraders.length > 0 &&
      upgraders[0] &&
      creep.name === upgraders[0].name &&
      creep.room.controller &&
      creep.room.controller.my &&
      creep.room.controller.level >= 7 &&
      !hostileCreeps &&
      highVolumeStorage
    ) {
      creep.say("⚡💪");
      creep.memory.mainUpgrader = true;
    } else {
      creep.memory.mainUpgrader = false;
    }

    if (creep.memory.upgrading) {
      /*
            if(creep.room.energyAvailable < 400 && creep.room.energyCapacityAvailable  > 400){
                Carrier.run(creep);
                return;
            }*/

      let numberOfControllerSlots = 0;
      if (creep.room.controller && creep.room.controller.level >= 4) {
        numberOfControllerSlots = RoomUtils.getCreepProspectingSlots(creep.room.controller).length;
        // console.log(creep.room.name,numberOfControllerSlots)
      }

      if (
        (sites.length > 0 || constructSpawn) &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.level >= 2 &&
        creep.room.controller?.ticksToDowngrade &&
        creep.room.controller.ticksToDowngrade >= 2000
      ) {
        creep.say("⚡ build");
        Builder.run(creep);

        /*=
                if(constructSpawn) {
                    if(creep.build(constructSpawn) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(constructSpawn, {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }
                else if(extensions[0] && creep.room.controller && creep.room.controller.level >= 2){
                    if(creep.build(extensions[0]) == ERR_NOT_IN_RANGE) {
                        creep.moveTo(extensions[0], {visualizePathStyle: {stroke: '#ffffff'}});
                    }
                }*/
      } else {

        if (
          numberOfControllerSlots > 0 &&
          creep.room.controller &&
          creep.room.controller.my &&
          !creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller?.pos.y, 1)

        ) {
          creep.moveTo(creep.room.controller);
          return;
        }

        if (
          numberOfControllerSlots > 0 &&
          creep.room.controller &&
          creep.room.controller.my &&
          !creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller?.pos.y, 1)
        ) {
          creep.moveTo(creep.room.controller);
        } else if (
          numberOfControllerSlots === 0 &&
          creep.room.controller &&
          creep.room.controller.my &&
          !creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller?.pos.y, 2)
        ) {
          creep.moveTo(creep.room.controller);
        } else if (
          creep.room.controller &&
          creep.room.controller.my &&
          !creep.room.controller.sign &&
          creep.signController(creep.room.controller, "X") == ERR_NOT_IN_RANGE
        ) {
          creep.moveTo(creep.room.controller);
        } else if (
          creep.room.controller &&
          creep.room.controller.my &&
          creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE
        ) {
          creep.moveTo(creep.room.controller);
        }
        else if (creep.room.controller && creep.room.controller.my && creep.room.controller.level == 1) {
          MovementUtils.generalGatherMovement(creep)
        } else if(creep.room.controller) {

            creep.moveTo(creep.room.controller);

        }
      }
    } else {
      const controllerLink = getLinkByTag(creep, "ControllerLink1");
      if (creep.memory.mainUpgrader && creep.room?.controller && creep.room?.controller.my) {
        const controllerLinkFlag = Game.flags[creep.room.name + "ControllerLink1"];

        if (
          creep.memory.role === "upgrader" &&
          controllerLink.store[RESOURCE_ENERGY] > 0 &&
          creep.room?.controller?.level >= 6 &&
          controllerLinkFlag
        ) {
          creep.say("⚡💪");
          MovementUtils.strongUpgraderSequence(creep, controllerLink);
          return;
        }
      }

      if (controllerLink) {
        MovementUtils.generalGatherMovement(creep, controllerLink);
      } else if(creep.room.controller) {
        const nearestContainerToController = creep.room.controller.pos.findClosestByRange(FIND_STRUCTURES, {
            filter: structure => {
              return (
                structure.structureType == STRUCTURE_CONTAINER && structure.store.energy > 0
              );
            }
          }) as StructureContainer
          if(nearestContainerToController) {
              creep.say("⚡C");
              const transferCode = creep.withdraw(nearestContainerToController,RESOURCE_ENERGY);
              if(nearestContainerToController && transferCode === ERR_NOT_IN_RANGE) {
                creep.moveTo(nearestContainerToController, { visualizePathStyle: { stroke: "#ffaa00" } });
              }
              return;
          }

      }
    }
  }
}
