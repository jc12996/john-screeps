import { SpawnUtils } from "utils/SpawnUtils";
import { Upgrader } from "./upgrader";
import { MovementUtils } from "utils/MovementUtils";
import { RepairUtils } from "utils/RepairUtils";
export class Repairer {
  public static run(creep: Creep) {
    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("🚧");
    }

    const canContinue = MovementUtils.returnHomeCheck(creep);
    if (!canContinue) {
      return;
    }

    if (creep.memory.repairing && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.repairing = false;
      creep.say("🔄 harvest");
    }
    if (!creep.memory.repairing && creep.store.getFreeCapacity() == 0) {
      creep.memory.repairing = true;
      creep.say("🚧 repair");
    }

    if (creep.memory.repairing) {
      const room = creep.room;
      const roads = room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_ROAD &&
            structure.hits < RepairUtils.buildingRatios(structure).maxRoadStrengthRepairer
          );
        }
      });

      const containers = room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_CONTAINER &&
            structure.hits < RepairUtils.buildingRatios(structure).maxContainerStrength
          );
        }
      });

      const ramparts = room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_RAMPART &&
            structure.hits < RepairUtils.buildingRatios(structure).maxRampartStrength
          );
        }
      });

      const walls = room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_WALL &&
            structure.hits < RepairUtils.buildingRatios(structure).maxWallStrength
          );
        }
      });

      const weakWalls = room.find(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_WALL &&
            structure.hits < RepairUtils.buildingRatios(structure).maxWallStrength
          );
        }
      });

      if (containers.length > 0) {
        // Find the container with the lowest health
        const weakestContainer = containers.reduce((weakest, container) => {
          return container.hits < weakest.hits ? container : weakest;
        });
        if (creep.repair(weakestContainer) == ERR_NOT_IN_RANGE) {
          creep.moveTo(weakestContainer, { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else if (ramparts.length > 0 && room.controller?.my) {
        if (creep.repair(ramparts[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(ramparts[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else if (weakWalls.length > 0 && room.controller?.my && room.controller?.level < 5) {
        if (creep.repair(weakWalls[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(weakWalls[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      }  else if (walls.length > 0 && room.controller?.my && room.controller?.level < 5) {
        if (creep.repair(walls[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(walls[0], { visualizePathStyle: { stroke: "#ffffff" } });
        }
      } else if (roads.length > 0 && creep.repair(roads[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(roads[0], { visualizePathStyle: { stroke: "#ffffff" } });
      } else {
        Upgrader.run(creep);
      }
    } else {
      MovementUtils.generalGatherMovement(creep);
    }
  }
}
