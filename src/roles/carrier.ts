import { SpawnUtils } from "utils/SpawnUtils";
import { getLinkByTag } from "links";
import { MovementUtils } from "utils/MovementUtils";
import { Labs } from "labs";

export class Carrier {
  public static run(creep: Creep): void {
    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      creep.say("🚚");
    }

    const canContinue = MovementUtils.returnHomeCheck(creep);
    if (!canContinue) {
      return;
    }

    const extensions = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_EXTENSION &&
          structure.room?.controller?.my &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    }) as StructureExtension[];

    const commandLevel = creep.room?.controller?.level ?? 1;

    if (commandLevel <= 2 && extensions.length < 6) {
      this.simpleCarrierSequence(creep, extensions);
      return;
    }

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

    const extensionLinkFlag2 = creep.room.find(FIND_FLAGS, {
      filter: link => {
        return link.name == creep.room.name + "ExtensionLink2";
      }
    });

    const storage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_STORAGE &&
          structure.room?.controller?.my &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
          structure.store[RESOURCE_ENERGY] < 900000
        );
      }
    });

    const terminal: StructureTerminal | null =
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_TERMINAL &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }) ?? null;

    const links = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_LINK;
      }
    });

    const carriers = _.filter(
      Game.creeps,
      creep => creep.memory.role == "carrier" && creep.room.name == spawn?.room.name
    );

    const labs: StructureLab[] = creep.room.find(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_LAB;
      }
    });

    if (
      ((terminal && terminal.store[RESOURCE_ENERGY] > 2000) ||
        (creep.room.energyCapacityAvailable > 1000 && creep.room.energyAvailable > 300)) &&
      extensionLinkFlag2 &&
      creep.room.energyAvailable > 0 &&
      links.length >= 3 &&
      carriers.length > 0 &&
      carriers[1] &&
      creep.name === carriers[1].name &&
      carriers.length > 3
    ) {
      creep.memory.extensionFarm = 2;
    } else if (
      ((storage && storage.store[RESOURCE_ENERGY] > 2000) || creep.room.energyCapacityAvailable > 1000) &&
      carriers[0] &&
      creep.name === carriers[0].name &&
      creep.room.energyAvailable > 0 &&
      links.length >= 2 &&
      carriers.length > 2
    ) {
      creep.memory.extensionFarm = 1;
    } else if (
      ((storage && storage.store[RESOURCE_ENERGY] > 2000) || creep.room.energyCapacityAvailable > 1000) &&
      carriers.length > 2 &&
      carriers[2] &&
      creep.name === carriers[2].name &&
      commandLevel >= 6 &&
      creep.room.energyAvailable > 0 &&
      labs.length > 0
    ) {
      creep.memory.extensionFarm = 3;

      const labSetFlags =
        creep.room.find(FIND_FLAGS, {
          filter: flag => {
            return flag.name.includes(creep.room.name + "SetLabs:");
          }
        })[0] ?? null;

      if (creep.room.controller?.my && creep.room.controller.level >= 6 && labSetFlags) {
        Labs.setLabMapper(creep.room);
      }
    } else {
      creep.memory.extensionFarm = undefined;
    }

    if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
      if (creep.memory?.extensionFarm === 1) {
        creep.say("🚚 X");
      } else if (creep.memory?.extensionFarm === 2) {
        creep.say("🚚 X2");
      } else if (creep.memory?.extensionFarm === 3) {
        creep.say("🔬");
      } else {
        creep.say("🚚");
      }
    }

    const nearestStorage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_STORAGE &&
          structure.room?.controller?.my &&
          structure.store[RESOURCE_ENERGY] < 900000
        );
      }
    });

    const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
      filter: flag => {
        return flag.color == COLOR_BLUE && flag.room?.controller?.my;
      }
    })[0] ?? undefined;

    const capacitySpawnLimit = creep.room.controller && creep.room.controller?.level > 6 ? 100 : 0;
    if (
      !creep.memory.carrying &&
      (creep.store.getFreeCapacity() == 0 || creep.store[RESOURCE_ENERGY] > capacitySpawnLimit)
    ) {
      creep.memory.carrying = true;
    }

    if (
      (!creep.memory.carrying &&
        creep.memory.extensionFarm === 3 &&
        creep.store[Labs.MAP.input1 as MineralBaseCompoundsConstant | MineralCompoundConstant] > 0) ||
      creep.store[Labs.MAP.input2 as MineralBaseCompoundsConstant | MineralCompoundConstant] > 0
    ) {
      creep.memory.carrying = true;
    }

    if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0 && creep.memory.extensionFarm !== 3) {
      creep.memory.carrying = false;
    }

    if (
      creep.memory.carrying &&
      creep.memory.extensionFarm === 3 &&
      creep.store[Labs.MAP.input1 as MineralBaseCompoundsConstant | MineralCompoundConstant] === 0 &&
      creep.store[Labs.MAP.input2 as MineralBaseCompoundsConstant | MineralCompoundConstant] === 0
    ) {
      creep.memory.carrying = false;
    }

    if (!creep.memory.carrying) {

      if (
        spawn &&
        spawn?.pos &&
        (creep.memory.extensionFarm === 2 || creep.memory.extensionFarm === 1) &&
        creep.room?.controller &&
        creep.room?.controller.my
      ) {
        if (creep.memory.extensionFarm === 2) {
          const extensionFarm2Flag = spawn.room.find(FIND_FLAGS,{
            filter: (fff:any) => fff.color === COLOR_PURPLE
          })[0]?? null
          const extensionLink = getLinkByTag(creep, "ExtensionLink2");
          if (
            creep.memory.role === "carrier" &&
            (nearestStorage || links.length >= 3) &&
            creep.room?.controller?.level >= 6 &&
            extensionFarm2Flag
          ) {
            creep.say("🚚 X2");
            MovementUtils.xHarvesterMovementSequence(
              creep,
              extensionFarm2Flag,
              extensionLink,
              nearestStorage,
              terminal
            );
          }
          return;
        }

        const extensionLink1 = getLinkByTag(creep, "ExtensionLink");
        if (
          creep.memory.role === "carrier" &&
          (nearestStorage || extensionLink1 || links.length >= 1) &&
          creep.room?.controller?.level >= 5
        ) {
          creep.say("🚚 X");
          MovementUtils.xHarvesterMovementSequence(creep, spawn, extensionLink1, nearestStorage, terminal);
          return;
        }
      }

      MovementUtils.generalGatherMovement(creep);
    } else if (creep.memory.carrying) {
      if (creep.memory.extensionFarm === 3 && terminal && labs.length > 0) {
        const canContinue = this.scienceCarrierSequence(creep, labs, terminal);
        if (!canContinue) {
          return;
        }
      }

      if (creep.memory.extensionFarm !== undefined && commandLevel >= 6) {
        const canContinue = MovementUtils.dropOffInTerminal(creep, terminal);
        if (!canContinue) {
          return;
        }
      }

      if (creep.memory.role === "miner" || creep.memory.hauling) {
        this.minerCarrierSequence(creep,labs);
        return;
      }

      if (creep.memory.extensionFarm === 1) {
        this.firstExtensionFarmCarrierSequence(creep,spawn,storage);
        return;
      }

      if(creep.memory.extensionFarm === 2) {
        this.secondExtensionFarmCarrierSequence(creep,spawn,terminal);
        return;
      }

      if(creep.memory.extensionFarm === 3) {
        this.labFarmCarrierSequence(creep,terminal);
        return;
      }

      if(creep.memory.hauling) {
        this.haulingSequence(creep);
        return;
      }


      this.normalCarrierSequence(
        creep,
        terminal,
        roomRallyPointFlag,
        storage,
        spawn
      );
    } else if (
      creep.room.controller &&
      creep.room.controller.my &&
      creep.upgradeController(creep.room.controller) == ERR_NO_BODYPART
    ) {
      const nearestAvailableWorkingRoleCreep = this.getNearestAvailableWorkingRoleCreep(creep, commandLevel);
      if (
        nearestAvailableWorkingRoleCreep &&
        creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        if (creep.memory?.extensionFarm === 1) {
          creep.say("🚚 XC");
        } else if (creep.memory?.extensionFarm === 2) {
          creep.say("🚚 X2C");
        } else {
          creep.say("🚚 C");
        }
        creep.moveTo(nearestAvailableWorkingRoleCreep);
      }
    } else if (roomRallyPointFlag) {
      creep.moveTo(roomRallyPointFlag);
    }
  }

  private static haulingSequence(creep:Creep) {
    const nearestStoreUnit = this.getNearestStoreUnit(creep);

    if (nearestStoreUnit) {
      creep.say("🚚P");
      const transferCode = creep.transfer(nearestStoreUnit,RESOURCE_ENERGY);
      if(nearestStoreUnit && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestStoreUnit, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    this.normalCarrierSequence(creep);

  }
  private static secondExtensionFarmCarrierSequence(creep:Creep,spawn:AnyStructure | null,terminal:StructureTerminal | null) {
    if (creep.memory.extensionFarm === 2) {
      const commandLevel = creep.room?.controller?.level ?? 1;

      const carriers = _.filter(
        Game.creeps,
        creepTemp => creepTemp.memory.role == "carrier" && creepTemp?.room && spawn?.room && creepTemp?.room?.name == spawn?.room?.name
      );

      let nearestTower = creep.pos.findInRange(FIND_STRUCTURES,2, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_TOWER &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            structure.store[RESOURCE_ENERGY] < 800 &&
            carriers.length &&
            ((commandLevel >= 6 && creep.room.energyAvailable > 800) || commandLevel < 6)
          );
        }
      })[0];

      let extension = creep.pos.findInRange(FIND_STRUCTURES,2, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_EXTENSION &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      })[0];

      const spawns = creep.room.find(FIND_MY_SPAWNS);
      if (creep.room.controller && creep.room.controller.level >= 6) {
        extension =
          creep.pos
            .findInRange(FIND_STRUCTURES, 4, {
              filter: structure => {
                return (
                  structure.structureType == STRUCTURE_EXTENSION &&
                  structure.room?.controller?.my &&
                  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
              }
            })
            .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0] ?? null;
      }

      if (creep.room.controller && creep.room.controller.level >= 6) {
        nearestTower =
          creep.pos.findInRange(FIND_STRUCTURES, 4, {
            filter: structure => {
              return (
                structure.structureType == STRUCTURE_TOWER &&
                structure.room?.controller?.my &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                structure.store[RESOURCE_ENERGY] < 800
              );
            }
          })[0] ?? null;
      }

      const extensionsNearMe: StructureExtension[] = creep.pos.findInRange(FIND_STRUCTURES, 4, {
        filter: struc => {
          return struc.structureType === STRUCTURE_EXTENSION && struc.store[RESOURCE_ENERGY] == 0;
        }
      }) as StructureExtension[];

      const nearestSpawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_SPAWN &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      });

      if (nearestTower && creep.transfer(nearestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚X2T");
        creep.moveTo(nearestTower);
      } else if (extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚X2E");
        creep.moveTo(extension);
      } else if (
        spawns.length >= 2 &&
        nearestSpawn &&
        creep.transfer(nearestSpawn, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚X2W");
        creep.moveTo(nearestSpawn);
      } else if (
        terminal &&
        creep.store.energy > 0 &&
        extensionsNearMe.length === 0 &&
        creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚TR");
        creep.moveTo(terminal);
      } else if(spawn && creep.room.energyCapacityAvailable === creep.room.energyAvailable){
        const extensionFarm2Flag = spawn.room.find(FIND_FLAGS,{
          filter: (fff:any) => fff.color === COLOR_PURPLE
        })[0]?? null
        creep.moveTo(extensionFarm2Flag.pos.x - 3, extensionFarm2Flag.pos.y + 3);
      }
      return;
    }
  }

  private static firstExtensionFarmCarrierSequence(creep:Creep,spawn:AnyStructure | null,storage:StructureStorage | null) {
    if (creep.memory.extensionFarm === 1) {

      const commandLevel = creep.room?.controller?.level ?? 1;

      const harvesters = _.filter(
        Game.creeps,
        creepTemp => creepTemp.memory.role == "harvester" && creepTemp?.room && spawn?.room && creepTemp?.room?.name == spawn?.room?.name
      );

      const carriers = _.filter(
        Game.creeps,
        creepTemp => creepTemp.memory.role == "carrier" && creepTemp?.room && spawn?.room && creepTemp?.room?.name == spawn?.room?.name
      );

      let nearestTower = creep.pos.findInRange(FIND_STRUCTURES,2, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_TOWER &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            structure.store[RESOURCE_ENERGY] < 800 &&
            carriers.length &&
            ((commandLevel >= 6 && creep.room.energyAvailable > 800) || commandLevel < 6)
          );
        }
      })[0];

      let extension = creep.pos.findInRange(FIND_STRUCTURES,2, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_EXTENSION &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      })[0];

      if (creep.room.controller && creep.room.controller.level >= 6) {
        extension =
          creep.pos
            .findInRange(FIND_STRUCTURES, 4, {
              filter: structure => {
                return (
                  structure.structureType == STRUCTURE_EXTENSION &&
                  structure.room?.controller?.my &&
                  structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
                );
              }
            })
            .sort((a, b) => creep.pos.getRangeTo(a) - creep.pos.getRangeTo(b))[0] ?? null;
      }

      if (creep.room.controller && creep.room.controller.level >= 6) {
        nearestTower =
          creep.pos.findInRange(FIND_STRUCTURES, 4, {
            filter: structure => {
              return (
                structure.structureType == STRUCTURE_TOWER &&
                structure.room?.controller?.my &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
                structure.store[RESOURCE_ENERGY] < 800
              );
            }
          })[0] ?? null;
      }

      const extensionsNearMe: StructureExtension[] = creep.pos.findInRange(FIND_STRUCTURES, 4, {
        filter: struc => {
          return struc.structureType === STRUCTURE_EXTENSION && struc.store[RESOURCE_ENERGY] == 0;
        }
      }) as StructureExtension[];


      if (harvesters.length >= 2 && carriers.length >= 2 && nearestTower && creep.transfer(nearestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚T");
        creep.moveTo(nearestTower);
      } else if (extension && creep.transfer(extension, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚XE");
        creep.moveTo(extension);
      } else if (nearestTower && !extension && creep.transfer(nearestTower, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚XT");
        creep.moveTo(nearestTower);
      } else if (
        storage &&
        !extension &&
        !nearestTower &&
        extensionsNearMe.length === 0 &&
        creep.store.energy > 0 &&
        creep.transfer(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚S");
        creep.moveTo(storage);
      }
      else if(spawn && creep.room.energyCapacityAvailable === creep.room.energyAvailable) {
        creep.moveTo(spawn.pos.x - 3, spawn.pos.y + 3);
      }
      return;
    }
  }

  private static getNearestAvailableWorkingRoleCreep(creep: Creep, commandLevel: number): Creep {
    return creep.pos.findClosestByPath(FIND_MY_CREEPS, {
      filter: workCreep => {
        if (commandLevel <= 2) {
          return (
            workCreep.memory.role === "upgrader" &&
            workCreep.store[RESOURCE_ENERGY] < 40 &&
            !creep.memory.hauling
          );
        }
        const storage = creep.room.find(FIND_STRUCTURES, {
          filter: s => s.structureType === STRUCTURE_STORAGE
        })[0] as StructureStorage | null;

        if (storage && storage.store[RESOURCE_ENERGY] > 10000 && workCreep.memory.extensionFarm === undefined) {
          return (
            workCreep.memory.role === "upgrader" &&
            workCreep.store[RESOURCE_ENERGY] < 40 &&
            !creep.memory.hauling
          );
        }

        if (
          workCreep.room.controller &&
          workCreep.room.controller.my &&
          workCreep.room.controller.level <= 3 &&
          workCreep.room.energyAvailable === workCreep.room.energyCapacityAvailable &&
          workCreep.memory.extensionFarm === undefined
        ) {
          return (
            workCreep.memory.role === "upgrader" &&
            workCreep.store[RESOURCE_ENERGY] < 40 &&
            !creep.memory.hauling
          );
        }

        return (
          ((workCreep.memory.role === "upgrader" && workCreep.memory.upgrading !== true) ||
            ((workCreep.memory.extensionFarm === 1 || workCreep.memory.extensionFarm === 2) &&
              workCreep.store.getFreeCapacity() > 0 &&
              workCreep.room.energyAvailable <
                (commandLevel >= 7
                  ? creep.memory.role === "miner"
                    ? workCreep.room.energyCapacityAvailable
                    : 1000
                  : 800))) &&
          workCreep.store.getFreeCapacity() > 0 &&
          !creep.memory.hauling &&
          (commandLevel > 4 || creep.room.energyAvailable >= 650)
        );
      }
    }) as Creep;
  }

  private static scienceCarrierSequence(creep: Creep, labs: StructureLab[], terminal: StructureTerminal): boolean {
    const nuker: StructureNuker | null =
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType === STRUCTURE_NUKER && structure.store;
        }
      }) ?? null;

    const factory: StructureFactory | null =
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType === STRUCTURE_FACTORY && structure.store;
        }
      }) ?? null;

    let labsAreFull = true;

    if (creep.store.energy > 0) {
      if (terminal && creep.store[RESOURCE_ENERGY] > 0) {
        if (creep.transfer(terminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
          creep.moveTo(terminal);
        }
        return false;
      }
    }

    let counter = 0;

    const input1 = Labs.MAP.input1 as MineralConstant;
    const input2 = Labs.MAP.input2 as MineralConstant;

    if (!Labs.inputLabs || Labs.inputLabs.length === 0) {
      return true;
    }
    for (const inputLab of Labs.inputLabs) {
      counter++;
      const inputCompound = counter === 1 ? input1 : input2;
      if (creep.store[inputCompound] > 0 && inputLab.store[inputCompound] < 3000) {
        labsAreFull = false;
        if (!labsAreFull) {
          creep.say("🔬" + inputCompound);
        }

        if (creep.store[RESOURCE_ENERGY] > 0) {
          creep.drop(RESOURCE_ENERGY);
        }

        if (creep.transfer(inputLab, inputCompound) === ERR_NOT_IN_RANGE) {
          creep.say("🔬" + inputCompound);
          creep.moveTo(inputLab);
        }

        return false;
      }

      if (terminal && creep.store[inputCompound] > 0 && labsAreFull) {
        if (creep.transfer(terminal, inputCompound) === ERR_NOT_IN_RANGE) {
          creep.say("🔬TR");
          creep.moveTo(terminal);
        }
        return false;
      }
    }

    if (terminal && creep.store[RESOURCE_ENERGY] > 0 && labsAreFull) {
      const storage: StructureStorage | null =
        creep.pos.findClosestByPath(FIND_STRUCTURES, {
          filter: structure => {
            return (
              structure.structureType === STRUCTURE_STORAGE &&
              structure.store &&
              structure.store[RESOURCE_ENERGY] < 900000
            );
          }
        }) ?? null;

      if (
        nuker &&
        nuker.store[RESOURCE_ENERGY] < 300000 &&
        creep.transfer(nuker, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        creep.say("🔬NE");
        creep.moveTo(nuker);
      } else if (
        factory &&
        factory.store[RESOURCE_ENERGY] < 25000 &&
        creep.transfer(factory, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        creep.say("🔬F");
        creep.moveTo(factory);
      } else if (
        terminal &&
        terminal.store[RESOURCE_ENERGY] < 300000 &&
        creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🔬TR");
        creep.moveTo(terminal);
        return false;
      } else if (
        storage &&
        storage.store[RESOURCE_ENERGY] < 900000 &&
        creep.transfer(storage, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
      ) {
        creep.say("🔬S");
        creep.moveTo(storage);
      } else {
        return true;
      }
      return false;
    }

    return true;
  }

  private static minerCarrierSequence(creep: Creep, labs:StructureLab[]) {
    if (creep.memory.role === "miner" || creep.memory.hauling) {
      const nearestContainerToController = creep.room.controller
        ? creep.room.controller.pos.findClosestByPath(FIND_STRUCTURES, {
            filter: structure => {
              return (
                structure.structureType == STRUCTURE_CONTAINER && structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
              );
            }
          })
        : null;
      labs = labs.filter(lab => {
        return lab.store.energy < 2000
      });

      const nearestStoreUnit = this.getNearestStoreUnit(creep);

      if (labs[0] && labs[0].store[RESOURCE_ENERGY] < 1900 && creep.transfer(labs[0], RESOURCE_ENERGY)) {
        creep.moveTo(labs[0])
      } else if (nearestStoreUnit && creep.transfer(nearestStoreUnit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.say("🚚 P");
        creep.moveTo(nearestStoreUnit, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (!nearestStoreUnit && nearestContainerToController) {
        if (
          nearestContainerToController &&
          creep.transfer(nearestContainerToController, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
        ) {
          creep.say("🚚 C");
          creep.moveTo(nearestContainerToController);
        }
      } else if (creep.room.controller && creep.room.controller?.my) {
        creep.say("🚚 C");
        if (creep.pos.inRangeTo(creep.room.controller, 4) === false) {
          creep.moveTo(creep.room.controller);
        } else {
          const nearestUpgrader = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
            filter: workCreep => {
              return workCreep.memory.role === "upgrader" && workCreep.memory.upgrading !== true;
            }
          });
          if (nearestUpgrader && creep.transfer(nearestUpgrader, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
            creep.moveTo(nearestUpgrader);
          } else if (!nearestUpgrader) {
            if (
              nearestStoreUnit &&
              creep.transfer(nearestStoreUnit, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
            ) {
              creep.say("🚚 P");
              creep.moveTo(nearestStoreUnit, { visualizePathStyle: { stroke: "#ffaa00" } });
            } else {
              creep.drop(RESOURCE_ENERGY);
            }
          }
        }
      }
      return;
    }
  }

  private static labFarmCarrierSequence(creep:Creep, terminal:StructureTerminal | null) {

    if (creep.memory.extensionFarm === 3) {

      const nearestStorage: StructureStorage | null = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_STORAGE &&
            structure.room?.controller?.my &&
            structure.store[RESOURCE_ENERGY] < 900000
          );
        }
      });

      const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
        filter: flag => {
          return flag.color == COLOR_BLUE && flag.room?.controller?.my;
        }
      });

      if (
        creep.store[RESOURCE_ENERGY] > 0 &&
        nearestStorage &&
        creep.transfer(nearestStorage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚S");
        creep.moveTo(nearestStorage);
      } else if (
        creep.store[RESOURCE_ENERGY] > 0 &&
        terminal &&
        creep.transfer(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚X2TR");
        creep.moveTo(terminal);
      } else if (roomRallyPointFlag.length) {
        creep.moveTo(roomRallyPointFlag[0]);
      }

      return;
    }
  }

  private static normalCarrierSequence(
    creep: Creep,
    terminal: StructureTerminal | null = null,
    roomRallyPointFlag: Flag | null = null,
    storage: StructureStorage  | null = null,
    spawn: AnyStructure  | null  = null
  ) {

    const commandLevel = creep.room?.controller?.level ?? 1;

    const carriers = _.filter(
      Game.creeps,
      creepTemp => creepTemp.memory.role == "carrier" && creepTemp?.room && spawn?.room && creepTemp?.room?.name == spawn?.room?.name
    );

    let transferCode = undefined;

    let nearestTower = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_TOWER &&
          structure.room?.controller?.my &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
          structure.store[RESOURCE_ENERGY] < 800 &&
          carriers.length &&
          ((commandLevel >= 6 && creep.room.energyAvailable > 800) || commandLevel < 6)
        );
      }
    });

    if(nearestTower) {
      creep.say("🚚T");
      transferCode = creep.transfer(nearestTower,RESOURCE_ENERGY);
      if(nearestTower && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestTower, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const maxEnergyNeeded = creep.room.controller && creep.room.controller.level >= 7 ? 1000 : 500;

    if (!creep.memory.hauling &&
      creep.room.energyAvailable > maxEnergyNeeded &&
      creep.memory.extensionFarm === undefined &&
      (creep.room.energyAvailable >= creep.room.energyCapacityAvailable * 0.8 || creep.room.energyAvailable >= 800) &&
      creep.room.controller &&
      creep.room.controller?.level < 8) {

      const nearestAvailableWorkingRoleCreep = this.getNearestAvailableWorkingRoleCreep(creep, commandLevel);
      if (
        nearestAvailableWorkingRoleCreep &&
        nearestAvailableWorkingRoleCreep.store.getFreeCapacity() > 0  &&
        creep.room.find(FIND_HOSTILE_CREEPS).length === 0 &&
        creep.transfer(nearestAvailableWorkingRoleCreep, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.say("🚚 C");
        creep.moveTo(nearestAvailableWorkingRoleCreep);
        return;
      }
    }

    let extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_EXTENSION &&
          structure.room?.controller?.my &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });
    if (extension) {
      creep.say("🚚E");
      transferCode = creep.transfer(extension,RESOURCE_ENERGY);
      if(extension && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(extension, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const nearestSpawn = creep.pos.findClosestByRange(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_SPAWN &&
          structure.room?.controller?.my &&
          structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
        );
      }
    });

    if (nearestSpawn && commandLevel < 6) {
      creep.say("🚚W");
      transferCode = creep.transfer(nearestSpawn,RESOURCE_ENERGY);
      if(nearestSpawn && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestSpawn, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    if (
      creep.store[RESOURCE_ENERGY] > 0 &&
      storage &&
      storage.store.energy < 6000
    ) {
      creep.say("🚚S");
      transferCode = creep.transfer(storage,RESOURCE_ENERGY);
      if(storage && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    if (
      creep.store[RESOURCE_ENERGY] > 0 &&
      terminal &&
      terminal.store.energy < 3000
    ) {
      creep.say("🚚TR");
      transferCode = creep.transfer(terminal,RESOURCE_ENERGY);
      if(terminal && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const nearestStoreUnit = this.getNearestStoreUnit(creep);

    if (nearestStoreUnit) {
      creep.say("🚚P");
      transferCode = creep.transfer(nearestStoreUnit,RESOURCE_ENERGY);
      if(nearestStoreUnit && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestStoreUnit, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    if (storage) {
      creep.say("🚚S");
      transferCode = creep.transfer(storage,RESOURCE_ENERGY);
      if(storage && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const nearestAvailableWorkingRoleCreep = this.getNearestAvailableWorkingRoleCreep(creep, commandLevel);
    if (nearestAvailableWorkingRoleCreep) {
      creep.say("🚚 C");
      transferCode = creep.transfer(nearestAvailableWorkingRoleCreep,RESOURCE_ENERGY);
      if(nearestAvailableWorkingRoleCreep && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestAvailableWorkingRoleCreep, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const controllerAdjContainer = creep.room.controller?.pos.findInRange(FIND_STRUCTURES, 7, {
      filter: (structure: StructureContainer) => {
        return structure.structureType === STRUCTURE_CONTAINER && structure.store.getFreeCapacity() > 0;
      }
    });

    if (controllerAdjContainer?.length) {
      creep.say("🚚CC");
      transferCode = creep.transfer(controllerAdjContainer[0],RESOURCE_ENERGY);
      if(controllerAdjContainer[0] && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(controllerAdjContainer[0], { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => source.amount >= creep.store.getCapacity()
    }) as Resource;

    if (droppedSource) {
      creep.say('🚚D');
      transferCode = creep.pickup(droppedSource);
      if(droppedSource && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    const holdingHarvests = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
      filter: harvestCreep => harvestCreep.memory.role === 'harvester' && harvestCreep.store.energy > 0
    }) as Creep;

    if (holdingHarvests) {
      creep.say('🚚H');
      transferCode = holdingHarvests.transfer(creep, RESOURCE_ENERGY);
      if(!creep.pos.isNearTo(holdingHarvests) && holdingHarvests && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(holdingHarvests, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    const droppedTombstone =
        creep.pos.findInRange(FIND_TOMBSTONES, 4, {
          filter: tomb => {
            return tomb.store && tomb.store[RESOURCE_ENERGY] > 0;
          }
        })[0] ?? null;

    if (droppedTombstone) {
      creep.say("🚚TT");
      transferCode = creep.withdraw(droppedTombstone,RESOURCE_ENERGY);
      if(droppedTombstone && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedTombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const droppedSource2 = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => source.amount > 0
    }) as Resource;

    if (droppedSource2) {
      creep.say('🚚D');
      transferCode = creep.pickup(droppedSource2);
      if(droppedSource2 && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource2, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    if (roomRallyPointFlag) {
      creep.moveTo(roomRallyPointFlag);
      return;
    }
  }

  private static getNearestStoreUnit(creep:Creep):StructureTerminal | StructureStorage | StructureContainer | StructureLink | null {

    if(creep.room.controller && creep.room.controller.my && creep.room.controller.level >= 6) {
      const nearestStoreUnit: StructureTerminal | StructureStorage | StructureContainer | StructureLink | null = creep.pos.findClosestByPath(
        FIND_STRUCTURES,
        {
          filter: structure => {
            return (
              (structure.structureType === STRUCTURE_TERMINAL
                || structure.structureType === STRUCTURE_STORAGE
              ) &&
              structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
              structure.room?.controller?.my
            );
          }
        }
      );
      return nearestStoreUnit;
    }

    const nearestStoreUnit: StructureTerminal | StructureStorage | StructureContainer | StructureLink | null = creep.pos.findClosestByPath(
      FIND_STRUCTURES,
      {
        filter: structure => {
          return (
            (structure.structureType === STRUCTURE_TERMINAL
              || structure.structureType === STRUCTURE_STORAGE
              || structure.structureType === STRUCTURE_CONTAINER
              || structure.structureType === STRUCTURE_LINK
              || structure.structureType === STRUCTURE_SPAWN
            ) &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0 &&
            structure.room?.controller?.my
          );
        }
      }
    );

    return nearestStoreUnit
  }

  private static simpleCarrierSequence(creep: Creep,extensions:StructureExtension[]) {

    if (
      !creep.memory.carrying &&
      creep.store.getFreeCapacity() == 0
    ) {
      creep.memory.carrying = true;
    }


    if (creep.memory.carrying && creep.store[RESOURCE_ENERGY] == 0) {
      creep.memory.carrying = false;
    }

    let transferCode = undefined;

    if(creep.memory.carrying) {

      if(creep.memory.hauling) {
        const nearestStoreUnit = this.getNearestStoreUnit(creep);

        if (nearestStoreUnit) {
          creep.say("🚚P");
          transferCode = creep.transfer(nearestStoreUnit,RESOURCE_ENERGY);
          if(nearestStoreUnit && transferCode === ERR_NOT_IN_RANGE) {
            creep.moveTo(nearestStoreUnit, { visualizePathStyle: { stroke: "#ffaa00" } });
          }
          return;
        }
      }

      const extension = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType === STRUCTURE_EXTENSION &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }) as StructureSpawn;

      const extensionCarriers = _.filter(
        Game.creeps,
        extensionCreep => extensionCreep.memory.role == "carrier" && extensionCreep.room.name == spawn?.room.name && extensionCreep.memory.extensionFarm === 1
      );
      if (extensions.length > 0 && extension && extensionCarriers.length === 0) {
        creep.say("🚚E");
        transferCode = creep.transfer(extension,RESOURCE_ENERGY);
        if(extension && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(extension, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
        return;
      }

      const spawn = creep.pos.findClosestByPath(FIND_MY_SPAWNS, {
        filter: structure => {
          return (
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }) as StructureSpawn;

      if(spawn) {
        creep.say("🚚W");
        transferCode = creep.transfer(spawn,RESOURCE_ENERGY);
        if(spawn && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(spawn, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
        return;
      }

      let nearestCreep = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
        filter: workingCreep => {
          return (
            (workingCreep.memory.role === 'upgrader' || workingCreep.memory.role === 'builder') &&
            workingCreep.store.energy < 40
          );
        }
      }) as Creep;

      if(nearestCreep) {
        creep.say("🚚C");
        transferCode = creep.transfer(nearestCreep,RESOURCE_ENERGY);
        if(transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(nearestCreep, { visualizePathStyle: { stroke: "#ffaa00" } });
        }
        return;
      }
    }



    const tombstone = creep.pos.findInRange(FIND_TOMBSTONES,4, {
      filter: tomb => tomb.store && tomb.store[RESOURCE_ENERGY] > 20
    })[0];

    if (tombstone) {
      creep.say('🚚TT');
      transferCode = creep.withdraw(tombstone,RESOURCE_ENERGY);
      if(tombstone && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(tombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const container = creep.pos.findInRange(FIND_STRUCTURES,4, {
      filter: structure => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] >= creep.store.getCapacity()
    })[0];

    if (container) {
      creep.say('🚚CC');
      transferCode = creep.withdraw(container,RESOURCE_ENERGY);
      if(container && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    const droppedSource = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => source.amount >= creep.store.getCapacity()
    }) as Resource;

    if (droppedSource) {
      creep.say('🚚D');
      transferCode = creep.pickup(droppedSource);
      if(droppedSource && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }



    const closeDroppedSource = creep.pos.findInRange(FIND_DROPPED_RESOURCES,3, {
      filter: source => source.amount >= 0
    })[0]?? null;

    if (closeDroppedSource) {
      creep.say('🚚D');
      transferCode = creep.pickup(closeDroppedSource);
      if(closeDroppedSource && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(closeDroppedSource, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }

    const holdingHarvests = creep.pos.findClosestByPath(FIND_MY_CREEPS, {
      filter: harvestCreep => harvestCreep.memory.role === 'harvester' && harvestCreep.store.energy > 20
    }) as Creep;

    if (holdingHarvests) {
      creep.say('🚚H');
      transferCode = holdingHarvests.transfer(creep, RESOURCE_ENERGY);
      if(!creep.pos.isNearTo(holdingHarvests) && holdingHarvests && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(holdingHarvests, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    const droppedSource2 = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => source.amount > 0
    }) as Resource;

    if (droppedSource2) {
      creep.say('🚚D');
      transferCode = creep.pickup(droppedSource2);
      if(droppedSource2 && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSource2, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }


    const tombstone2 = creep.pos.findClosestByPath(FIND_TOMBSTONES, {
      filter: tomb => tomb.store && tomb.store[RESOURCE_ENERGY] > 20
    });

    if (tombstone2) {
      creep.say('🚚TT');
      transferCode = creep.withdraw(tombstone2,RESOURCE_ENERGY);
      if(tombstone2 && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(tombstone2, { visualizePathStyle: { stroke: "#ffaa00" } });
      }
      return;
    }



    MovementUtils.generalGatherMovement(creep);

  }


}
