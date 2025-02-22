import { SpawnUtils } from "utils/SpawnUtils";
import { Repairer } from "./repairer";
import { AutoSpawn } from "autospawn";
import { MovementUtils } from "utils/MovementUtils";
import { Upgrader } from "./upgrader";
import { RoomUtils } from "utils/RoomUtils";
import { link } from "fs";
export class Builder {
  private static moveAndBuild(creep: Creep, target: any) {
    let numberOfBuilderSlots = 0;
    if (creep.room.controller && creep.room.controller.level >= 4) {
      numberOfBuilderSlots = RoomUtils.getCreepProspectingSlots(target).length;
      // console.log(creep.room.name,numberOfBuilderSlots)
    }

    if (numberOfBuilderSlots > 0 && !creep.pos.inRangeTo(target.pos.x, target?.pos.y, 1)) {
      creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
    } else if (target) {
      if (creep.build(target) == ERR_NOT_IN_RANGE) {
        creep.moveTo(target, { visualizePathStyle: { stroke: "#ffffff" } });
      }
    }
  }

  public static run(creep: Creep) {
    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("🔨");
    }

    const canContinue = MovementUtils.returnHomeCheck(creep);
    if (!canContinue) {
      return;
    }

    if(creep.memory.role === 'settler') {
      creep.memory.building = true;
    } else {
      if (creep.memory.building && creep.store[RESOURCE_ENERGY] == 0) {
        creep.memory.building = false;
        creep.say("🔄 harvest");
      }
      if (!creep.memory.building && (creep.store.getFreeCapacity() == 0 || creep.store[RESOURCE_ENERGY] >  0)) {
        creep.memory.building = true;
        creep.say("🔨 build");
      }
    }


    const constructionSites = creep.room.find(FIND_CONSTRUCTION_SITES);

    if (!constructionSites.length) {
      Repairer.run(creep);
      return;
    }

    if (creep.memory.building) {



      if(creep.room?.controller && creep.room?.controller.my && (creep.room?.controller.level < 2 || (creep.room.controller?.ticksToDowngrade && creep.room.controller.ticksToDowngrade < 2000) || creep.memory.upgrading)
      ) {

        if((creep.room.controller?.ticksToDowngrade && creep.room.controller.ticksToDowngrade >= 6000) || !creep.room.controller?.ticksToDowngrade) {
          creep.memory.upgrading = false;
        } else {
            creep.memory.upgrading = true;
        }

        const moveCode = creep.upgradeController(creep.room.controller);
        creep.say("⚡ upgrade");

        if(!creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller.pos.y, 3) && moveCode === ERR_NOT_IN_RANGE) {
            creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }




      if (
        creep.memory.upgrading &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.ticksToDowngrade > 5000
      ) {
        creep.memory.upgrading = false;
      }
      if (
        !creep.memory.upgrading &&
        creep.room.controller &&
        creep.room.controller.my &&
        creep.room.controller.ticksToDowngrade <= 5000
      ) {
        creep.memory.upgrading = true;
      }

      creep.memory.upgrading = false;

      const constructSpawn = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_SPAWN || site.structureType == STRUCTURE_TOWER;
        }
      });

      const constructTerminal = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_TERMINAL;
        }
      });

      const storageSite = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_STORAGE;
        }
      });

      const links = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_LINK;
        }
      });

      const container = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_CONTAINER;
        }
      });

      const extensions = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_EXTENSION;
        }
      });

      const targets = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return (
            site.structureType !== STRUCTURE_ROAD &&
            site.structureType !== STRUCTURE_RAMPART &&
            site.structureType !== STRUCTURE_WALL
          );
        }
      });

      const roads = creep.pos.findClosestByRange(FIND_CONSTRUCTION_SITES, {
        filter: site => {
          return site.structureType == STRUCTURE_ROAD;
        }
      });

      const ramparts = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: rampart => {
          return rampart.structureType == STRUCTURE_RAMPART;
        }
      });

      const walls = creep.room.find(FIND_CONSTRUCTION_SITES, {
        filter: rampart => {
          return rampart.structureType == STRUCTURE_WALL;
        }
      });

      const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
        filter: flag => {
          return flag.color == COLOR_BLUE && flag.room?.controller?.my;
        }
      });

      if (constructSpawn) {
        this.moveAndBuild(creep, constructSpawn);
      } else if (constructTerminal) {
        this.moveAndBuild(creep, constructTerminal);
      } else  if (links.length) {
        this.moveAndBuild(creep, links[0]);
      } else if (storageSite) {
        this.moveAndBuild(creep, storageSite);
      } else if (extensions[0]) {
        this.moveAndBuild(creep, extensions[0]);
      } else if (container.length && creep.memory.role !== "upgrader") {
        this.moveAndBuild(creep, container[0]);
      }  else if (walls.length && creep.memory.role !== "upgrader") {
        this.moveAndBuild(creep, walls[0]);
      } else if (ramparts.length && creep.memory.role !== "upgrader") {
        this.moveAndBuild(creep, ramparts[0]);
      } else if (roads && creep.memory.role !== "upgrader") {
        this.moveAndBuild(creep, roads);
      } else if (targets.length) {
        this.moveAndBuild(creep, targets[0]);
      } else {
        Repairer.run(creep);
      }
    } else {
      if(creep.memory.role === 'upgrader' && creep.room.controller) {
        creep.moveTo(creep.room.controller)
        return;
      }
      //console.log('hhhhh')
      MovementUtils.generalGatherMovement(creep);
    }
  }
}
