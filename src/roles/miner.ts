import { MovementUtils } from "utils/MovementUtils";
import { Carrier } from "./carrier";
import { SpawnUtils } from "utils/SpawnUtils";
import { Harvester } from "./harvester";
import { Labs } from "labs";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { Dismantler } from "./dismantler";
import { Upgrader } from "./upgrader";
import { Builder } from "./builder";

export class Miner {
  public static run(creep: Creep,isHomeRoomHarvester:boolean = false): void {
    if (!creep.memory.isBoosted) {
      const canContinue = Labs.boostCreep(creep);
      if (!canContinue) {
        return;
      }
    }

    const spawn = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType == STRUCTURE_SPAWN && structure.room?.controller?.my;
      }
    });

    let miners = _.filter(Game.creeps, creep => creep.memory.role == "miner" && creep.room.name == spawn?.room.name);

    const extractor =
      creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_EXTRACTOR
      })[0] ?? null;

    const storage =
      creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_STORAGE
      })[0] ?? null;

    const terminal =
      (creep.room.find(FIND_STRUCTURES, {
        filter: structure => structure.structureType === STRUCTURE_TERMINAL
      })[0] as StructureTerminal) ?? null;

    const mineral = creep.room.find(FIND_MINERALS)[0];

    if (!!!creep.memory?.firstSpawnCoords) {
      return;
    }

    const firstRoom = Game.rooms[creep.memory.firstSpawnCoords];
    const firstRoomCommandLevel = firstRoom.controller?.level ?? 0;

    if (
      storage &&
      mineral &&
      firstRoom.terminal &&
      firstRoom.terminal.store[mineral.mineralType] < 50000 &&
      mineral.mineralAmount > 0 &&
      extractor &&
      miners[0] &&
      creep.name === miners[0]?.name &&
      creep.room.controller &&
      creep.room.controller.my &&
      creep.room.controller?.level >= 2 &&
      creep.getActiveBodyparts(WORK) > 0
    ) {
      creep.memory.extractorMiner = true;
    } else if (!creep.memory.extractorMiner) {
      creep.memory.extractorMiner = false;
    } else if (firstRoom.terminal && firstRoom.terminal.store[mineral.mineralType] >= 50000) {
      if (firstRoom.terminal.store[mineral.mineralType] && creep.store[mineral.mineralType] > 0) {
        creep.drop(mineral.mineralType);
      }
      creep.memory.extractorMiner = false;
    }

    let mineType: "mine" | "haul" | "allAround" = "allAround";

    if (firstRoomCommandLevel >= 2) {
      if (creep.getActiveBodyparts(WORK) > 0) {
        mineType = "mine";
      } else if (creep.memory.hauling) {
        mineType = "haul";
      } else {
        mineType = "allAround";
      }
      const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: source => {
          return source.amount >= 50;
        }
      });
      if (
        creep.memory.hauling &&
        creep.room !== firstRoom &&
        mineType !== "mine" &&
        droppedSources &&
        creep.pickup(droppedSources) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffaa00" } });
        return;
      }
    }

    if (
      creep.memory.extractorMiner === true &&
      terminal?.store?.getFreeCapacity() > 0 &&
      creep.getActiveBodyparts(WORK) > 0
    ) {
      if (creep.store[RESOURCE_ENERGY] > 0) {
        this.dropOffStuff(creep, firstRoom);
        return;
      }
      this.creepExtractor(creep, extractor, storage, terminal, mineral);
      return;
    }

    this.creepMiner(creep, isHomeRoomHarvester, mineType);
  }

  private static creepExtractor(
    creep: Creep,
    extractor: AnyStructure,
    storage: AnyStructure,
    terminal: StructureTerminal,
    mineral: Mineral
  ) {
    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("⛏ ⛰");
    }

    if (!mineral || !extractor || !storage) {
      return;
    }

    if (
      !creep.memory.carrying &&
      (creep.store.getFreeCapacity() == 0 || (creep?.ticksToLive && creep.ticksToLive < 60))
    ) {
      creep.memory.carrying = true;
    }

    if (creep.memory.carrying && creep.store[mineral.mineralType] == 0) {
      creep.memory.carrying = false;
    }

    if (!creep.memory.carrying) {
      const droppedMinerals = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: source => {
          return source.amount >= 0 && source.resourceType === mineral.mineralType;
        }
      });

      const hLabs = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: source => {
          return source.structureType == STRUCTURE_LAB && source.store[mineral.mineralType];
        }
      });

      const droppedMineralTombstone = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
        filter: tomb => {
          return tomb.store && tomb.store[mineral.mineralType] > 0;
        }
      });

      if (
        droppedMineralTombstone &&
        creep.withdraw(droppedMineralTombstone, mineral.mineralType) === ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(droppedMineralTombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (droppedMinerals && creep.pickup(droppedMinerals) === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedMinerals, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (extractor && mineral && creep.harvest(mineral) === ERR_NOT_IN_RANGE) {
        creep.moveTo(extractor, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (
        storage &&
        creep.room.controller?.my &&
        mineral &&
        creep.withdraw(storage, mineral.mineralType) === ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (hLabs && creep.withdraw(hLabs, mineral.mineralType, 100) === ERR_NOT_IN_RANGE) {
        creep.moveTo(hLabs, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    } else {
      if (terminal && mineral && creep.transfer(terminal, mineral.mineralType) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (storage && mineral && creep.transfer(storage, mineral.mineralType) === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
    }
  }

  private static creepMiner(creep: Creep, isHomeRoomHarvester: boolean=false, minerType: "mine" | "haul" | "allAround") {
    if (!creep.memory.carrying && (creep.store.getFreeCapacity() == 0 || creep.store[RESOURCE_ENERGY] > 500)) {
      creep.memory.carrying = true;
    }

    if ((creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) || minerType === "mine") {
      creep.memory.carrying = false;
    }

    const constructionContainers =
      creep.pos.findInRange(FIND_CONSTRUCTION_SITES, 1, {
        filter: struc => {
          return struc.structureType === STRUCTURE_CONTAINER && minerType === "mine";
        }
      })[0] ?? null;

    const repairContainers =
      creep.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: struc => {
          return (
            struc.structureType === STRUCTURE_CONTAINER && minerType === "mine" && struc.hits < struc.hitsMax - 150000
          );
        }
      })[0] ?? null;

    const containers =
      creep.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: struc => {
          return struc.structureType === STRUCTURE_CONTAINER
        }
      })[0] ?? null;

    if (
      (constructionContainers || repairContainers) &&
      minerType === "mine" &&
      creep.memory.building &&
      creep.store[RESOURCE_ENERGY] == 0
    ) {
      creep.memory.building = false;
      creep.say("🔄 harvest");
    }
    if (
      (constructionContainers || repairContainers) &&
      minerType === "mine" &&
      !creep.memory.building &&
      creep.store.getFreeCapacity() == 0
    ) {
      creep.memory.building = true;
      creep.say("🔨 build");
    }

    if (!creep.memory.assignedMineFlag && !isHomeRoomHarvester) {
      return;
    }

    let mineFlag = creep.room.find(FIND_FLAGS)[0] ?? null;
    if(!isHomeRoomHarvester && creep.memory.assignedMineFlag) {
      mineFlag = Game.flags[creep.memory.assignedMineFlag] as Flag;
    }


    if (!!!mineFlag) {
      return;
    }

    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      if(isHomeRoomHarvester) {
        creep.say('⛏');
      }else {
        creep.say("⛏" + mineFlag.room?.name);
      }

    }

    if (creep.room != mineFlag.room) {
      MovementUtils.goToFlag(creep, mineFlag);
      return;
    }


    if(Game.flags.dismantleHere && Game.flags.dismantleHere.room === creep.room) {
      Dismantler.run(creep);
      return;
    }


    const finalSource = creep.pos.findClosestByPath(FIND_SOURCES_ACTIVE);


    if (
      containers &&
      creep.pos.isEqualTo(containers.pos.x, containers.pos.y)

    ) {
      const nextSources = creep.pos.findClosestByRange(FIND_SOURCES);
      console.log(creep.name,nextSources,nextSources,creep.room.energyCapacityAvailable,creep.room.energyAvailable)
      if(nextSources && (nextSources?.energy === 0 || !nextSources?.energy) ) {
        return;
      }

    }




    const nearestContainer = creep.pos.findInRange(FIND_STRUCTURES,1, {
      filter: (sss) => {

        const creepsOnContainer = mineFlag.room?.find(FIND_MY_CREEPS,{
          filter: (cccc) => cccc.pos.isEqualTo(sss)
        });

        return sss.structureType === STRUCTURE_CONTAINER && sss.pos.findInRange(FIND_SOURCES_ACTIVE,1) && !creepsOnContainer?.length
      }
    })[0] ?? null;





    if (
      finalSource &&
      nearestContainer &&
      !creep.pos.isNearTo(nearestContainer.pos.x, nearestContainer.pos.y) &&
      !creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y)
    ) {
      creep.moveTo(nearestContainer, { visualizePathStyle: { stroke: "#FFFFFF" } });
      return;
    }


    if (
      finalSource &&
      (!nearestContainer || !creep.pos.isEqualTo(nearestContainer.pos.x, nearestContainer.pos.y)) &&
      !creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y) &&
      !creep.pos.findInRange(FIND_SOURCES_ACTIVE, 1).length
    ) {
      creep.moveTo(finalSource, { visualizePathStyle: { stroke: "#FFFFFF" } });
      return;
    }

    if (!finalSource) {
      return;
    }

    const mineCode = creep.harvest(finalSource);
    if (
      mineCode == ERR_NOT_IN_RANGE &&
      (!nearestContainer || !creep.pos.isEqualTo(nearestContainer.pos.x, nearestContainer.pos.y)) &&
      !creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y) &&
      !creep.pos.isNearTo(nearestContainer.pos.x, nearestContainer.pos.y) &&
      !creep.pos.findInRange(FIND_SOURCES_ACTIVE, 1).length
    ) {
      creep.moveTo(finalSource, { visualizePathStyle: { stroke: "#FFFFFF" } });
      return;
    }

    if (
      nearestContainer &&
      !creep.pos.isNearTo(nearestContainer.pos.x, nearestContainer.pos.y)
    ) {
      creep.moveTo(nearestContainer, { visualizePathStyle: { stroke: "#FFFFFF" } });
      return;
    }

    if (
      !constructionContainers &&
      creep.pos.isNearTo(finalSource.pos.x, finalSource.pos.y) &&
      !creep.pos.findInRange(FIND_STRUCTURES, 1, {
        filter: structure => structure.structureType === STRUCTURE_CONTAINER
      }).length &&
      !isHomeRoomHarvester
    ) {
      ScaffoldingUtils.createContainers(creep);
    }

    const smallerControlledRoom = creep.room.controller && creep.room.controller.my && creep.room.controller?.level <= 2;
    if(smallerControlledRoom && creep.room.controller && creep.room.controller.ticksToDowngrade > 0 && creep.room.controller.ticksToDowngrade < 2000) {
      Upgrader.run(creep);
      return;
    }

    if(isHomeRoomHarvester) {
      const adjLink = creep.pos.findInRange(FIND_STRUCTURES,1,{
          filter: (struc) => {
              return struc.structureType === STRUCTURE_LINK
          }
      })[0] as StructureLink ?? null;
      if(adjLink && adjLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0 && containers) {
        if(containers) {
          creep.withdraw(containers,RESOURCE_ENERGY);
        }
        if(adjLink.store.getFreeCapacity(RESOURCE_ENERGY) > 0) {
          creep.transfer(adjLink, RESOURCE_ENERGY);
          return;
        }
      }
    }


    if (repairContainers && creep.store.energy > 0 && !isHomeRoomHarvester) {
      creep.repair(repairContainers);
    } else if (constructionContainers && creep.store.energy > 0 && !isHomeRoomHarvester) {
      creep.build(constructionContainers);
    } else if (containers) {
      creep.transfer(containers, RESOURCE_ENERGY);
    } else {
      creep.drop(RESOURCE_ENERGY);
    }
  }

  private static dropOffStuff(creep: Creep, firstRoom: any) {
    const roomStructures = firstRoom.find(FIND_MY_SPAWNS);

    if (creep.room !== firstRoom) {
      creep.moveTo(roomStructures[0]);
      return;
    }

    Carrier.run(creep);
  }
}
