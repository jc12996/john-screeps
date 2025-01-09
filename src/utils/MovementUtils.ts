import { AutoSpawn } from "autospawn";
import { SpawnUtils } from "./SpawnUtils";
import { PeaceTimeEconomy } from "./EconomiesUtils";
import { LabMapper, Labs } from "labs";
import { Carrier } from "roles/carrier";

export class MovementUtils {
  private static DIRECTIONS_ARRAY = [TOP, TOP_RIGHT, RIGHT, BOTTOM_RIGHT, BOTTOM, BOTTOM_LEFT, LEFT, TOP_LEFT];
  public static randomDirectionSelector(): DirectionConstant {
    return MovementUtils.DIRECTIONS_ARRAY[Math.floor(Math.random() * MovementUtils.DIRECTIONS_ARRAY.length)];
  }

  public static nearestExit(creep: Creep): RoomPosition {
    const exits = creep.room.find(FIND_EXIT);
    return exits[0];
  }

  public static goToAttackFlag(creep: Creep): void {
    this.goToFlag(creep, Game.flags.attackFlag);
  }

  public static goToFlag(creep: Creep, flag: Flag | Creep): void {
    var friendlyRamparts = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES, {
      filter: site => {
        return (
          site.structureType == STRUCTURE_RAMPART &&
          !site.isPublic &&
          site.owner &&
          SpawnUtils.FRIENDLY_OWNERS_FILTER(site.owner)
        );
      }
    });

    const invadorCoreTower = flag.room?.find(FIND_HOSTILE_STRUCTURES, {
      filter: structure => {
        return structure.structureType === STRUCTURE_TOWER && structure.owner && structure.owner.username === "Invader";
      }
    });

    if (invadorCoreTower && invadorCoreTower.length > 0) {
      if (flag.name === "rallyFlag") {
        Game.flags.rallyFlag.remove();
        if (Game.flags.rallyFlag2) {
          creep.room.createFlag(Game.flags.rallyFlag2.pos, "rallyFlag");
        }
      }
      if (flag.name === "rallyFlag2") {
        Game.flags.rallyFlag2.remove();
      }
      if (flag.name === "dismantleFlag") {
        Game.flags.dismantleFlag.remove();
      }
      if (flag.name === "attackFlag") {
        Game.flags.attackFlag.remove();
      }
    }

    const isPatrolCreep =
      creep.memory.role === "healer" ||
      creep.memory.role === "attacker" ||
      creep.memory.role === "meatGrinder" ||
      creep.memory.role === "dismantler" ||
      creep.memory.role === "scout";

    if (Game.flags.rallyFlag2 && Game.flags.rallyFlag && isPatrolCreep) {
      if (!!Game.flags?.stopPatrolFlag) {
        if (Game.flags.rallyFlag2) {
          Game.flags.rallyFlag2.remove();
        }
        Game.flags.stopPatrolFlag.remove();
        return;
      }

      const creepIsNearFlag =
        creep.pos.findInRange(FIND_FLAGS, 6, {
          filter: fff => fff.name === "rallyFlag"
        }).length > 0;

      if (!creep.memory.hasJoinedPatrol) {
        flag = Game.flags.rallyFlag;
        if (
          creep.moveTo(flag, {
            costCallback: function (roomName, costMatrix) {
              if (Game.rooms[roomName]) {
                const sourceKeepers = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
                  filter: c => c.owner.username === "Source Keeper"
                });
                sourceKeepers.forEach(keeper => {
                  for (let x = keeper.pos.x - 5; x <= keeper.pos.x + 5; x++) {
                    for (let y = keeper.pos.y - 5; y <= keeper.pos.y + 5; y++) {
                      if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                        costMatrix.set(x, y, 20);
                      }
                    }
                  }
                });
              }
            }
          }) === ERR_NO_PATH &&
          friendlyRamparts
        ) {
          creep.moveTo(friendlyRamparts, {visualizePathStyle: {stroke: '#ffaa00'}});
        }

        if (creepIsNearFlag) {
          creep.memory.hasJoinedPatrol = true;
        }

        return;
      }

      if (Game.flags.rallyFlag2?.room && Game.flags.rallyFlag?.room) {
        new RoomVisual(Game.flags.rallyFlag2.room.name).line(
          Game.flags.rallyFlag2.pos.x,
          Game.flags.rallyFlag2.pos.y,
          Game.flags.rallyFlag2.pos.x - 3,
          Game.flags.rallyFlag2.pos.y,
          { color: "red" }
        );
        new RoomVisual(Game.flags.rallyFlag2.room.name).line(
          Game.flags.rallyFlag2.pos.x - 3,
          Game.flags.rallyFlag2.pos.y,
          Game.flags.rallyFlag2.pos.x - 2,
          Game.flags.rallyFlag2.pos.y + 1,
          { color: "red" }
        );
        new RoomVisual(Game.flags.rallyFlag2.room.name).line(
          Game.flags.rallyFlag2.pos.x - 3,
          Game.flags.rallyFlag2.pos.y,
          Game.flags.rallyFlag2.pos.x - 2,
          Game.flags.rallyFlag2.pos.y - 1,
          { color: "red" }
        );
        new RoomVisual(Game.flags.rallyFlag2.room.name).text(
          "🚶 Going to " + Game.flags.rallyFlag2.room.name,
          Game.flags.rallyFlag2.pos.x - 3,
          Game.flags.rallyFlag2.pos.y,
          { align: "right", opacity: 0.8 }
        );

        new RoomVisual(Game.flags.rallyFlag.room.name).line(
          Game.flags.rallyFlag.pos.x - 3,
          Game.flags.rallyFlag.pos.y,
          Game.flags.rallyFlag.pos.x,
          Game.flags.rallyFlag.pos.y,
          { color: "green" }
        );
        new RoomVisual(Game.flags.rallyFlag.room.name).line(
          Game.flags.rallyFlag.pos.x,
          Game.flags.rallyFlag.pos.y,
          Game.flags.rallyFlag.pos.x - 1,
          Game.flags.rallyFlag.pos.y + 1,
          { color: "green" }
        );
        new RoomVisual(Game.flags.rallyFlag.room.name).line(
          Game.flags.rallyFlag.pos.x,
          Game.flags.rallyFlag.pos.y,
          Game.flags.rallyFlag.pos.x - 1,
          Game.flags.rallyFlag.pos.y - 1,
          { color: "green" }
        );
        new RoomVisual(Game.flags.rallyFlag.room.name).text(
          "🚶 Arriving from " + Game.flags.rallyFlag.room.name,
          Game.flags.rallyFlag.pos.x + 8,
          Game.flags.rallyFlag.pos.y,
          { align: "right", opacity: 0.8 }
        );
      }

      if (flag.name === "rallyFlag" && creepIsNearFlag && isPatrolCreep) {
        const creepIsInSquad =
          creep.pos.findInRange(FIND_MY_CREEPS, 3, {
            filter: myCreep =>
              myCreep.getActiveBodyparts(ATTACK) > 0 ||
              myCreep.getActiveBodyparts(RANGED_ATTACK) > 0 ||
              (myCreep.memory.role === "scout" && !Game.flags.scoutFlag)
          }).length >= (!Game.flags.scoutFlag && Game.flags.startScouting ? 1 : PeaceTimeEconomy.TOTAL_ATTACKER_SIZE);
        if (creepIsInSquad) {
          const tempRallyFlag = flag;
          Game.flags.rallyFlag.setPosition(Game.flags.rallyFlag2.pos);
          Game.flags.rallyFlag2.setPosition(tempRallyFlag.pos);
          flag = Game.flags.rallyFlag;
        }
      }

      if (!!!Game.flags?.rallyFlag2 && !!!Game.flags?.rallyFlag && isPatrolCreep) {
        creep.memory.hasJoinedPatrol = undefined;
      }
    }

    if (
      creep.moveTo(flag, {
        costCallback: function (roomName, costMatrix) {
          if (Game.rooms[roomName]) {
            const sourceKeepers = Game.rooms[roomName].find(FIND_HOSTILE_CREEPS, {
              filter: c => c.owner.username === "Source Keeper"
            });
            sourceKeepers.forEach(keeper => {
              for (let x = keeper.pos.x - 5; x <= keeper.pos.x + 5; x++) {
                for (let y = keeper.pos.y - 5; y <= keeper.pos.y + 5; y++) {
                  if (x >= 0 && x < 50 && y >= 0 && y < 50) {
                    costMatrix.set(x, y, 20);
                  }
                }
              }
            });
          }
        },
        visualizePathStyle: {stroke: '#ffaa00'}
      }) === ERR_NO_PATH &&
      friendlyRamparts
    ) {
      creep.moveTo(friendlyRamparts, {visualizePathStyle: {stroke: '#ffaa00'}});
    }
  }

  public static goToRally(creep: Creep): void {
    this.goToFlag(creep, Game.flags.rallyFlag);
  }

  public static defaultArmyMovement(creep: Creep, flag: Flag | Creep | undefined): void {
    const canProceed = MovementUtils.claimerSettlerMovementSequence(creep);
    if (!canProceed) {
      return;
    }

    if (flag) {
      MovementUtils.goToFlag(creep, flag);
    } else if (Game?.flags?.attackFlag) {
      MovementUtils.goToAttackFlag(creep);
    } else if (Game?.flags?.rallyFlag) {
      MovementUtils.goToRally(creep);
    } else {
      creep.move(MovementUtils.randomDirectionSelector());
    }
  }

  public static generalGatherMovement(
    creep: Creep,
    controllerLink: StructureLink | undefined = undefined,
    targetSource: any = undefined
  ) {
    const container = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return (
          structure.structureType == STRUCTURE_CONTAINER &&
          structure.store[RESOURCE_ENERGY] > 50 &&
          structure.room?.controller?.my
        );
      }
    }) as StructureContainer;

    let terminal: StructureTerminal | null =
      creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return (
            structure.structureType == STRUCTURE_TERMINAL &&
            structure.room?.controller?.my &&
            structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0
          );
        }
      }) ?? null;

    if (creep.memory.extensionFarm == 1) {
      terminal = null;
    }

    const nearestStorageOrTerminal: StructureTerminal | StructureStorage | null = creep.pos.findClosestByPath(
      FIND_STRUCTURES,
      {
        filter: structure => {
          return (
            (structure.structureType === STRUCTURE_TERMINAL || structure.structureType === STRUCTURE_STORAGE) &&
            (structure.store[RESOURCE_ENERGY] > 10000 || creep.memory.extensionFarm !== undefined) &&
            structure.room?.controller?.my
          );
        }
      }
    );

    const roomRallyPointFlag = creep.room.find(FIND_FLAGS, {
      filter: flag => {
        return flag.color == COLOR_BLUE && flag.room?.controller?.my;
      }
    });


    const commandLevel = creep.room?.controller?.level ?? 1;

    if (creep.memory.role === "upgrader" || creep.memory.role === "builder") {
      if (
        commandLevel >= 4 &&
        commandLevel < 8 &&
        creep.memory.role == "upgrader" &&
        creep.room.controller &&
        creep.pos.inRangeTo(creep.room.controller.pos.x, creep.room.controller?.pos.y, 2)
      ) {
        return;
      }


      const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: source => {
          return source.amount >= 50 && source.room?.controller?.my && source.resourceType === RESOURCE_ENERGY;
        }
      });

      let transferCode = undefined;
      if (
        (creep.memory.role === "builder" ||
          (creep.room.controller && creep.room.controller.level <= 2) ||
          (droppedSources && creep.pos.inRangeTo(droppedSources.pos, 3))) &&
        droppedSources
      ) {
        transferCode = creep.pickup(droppedSources);
        if(droppedSources && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }


       if (
        creep.room.controller &&
        creep.room.controller.pos.findInRange(FIND_STRUCTURES, 7, {
          filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
        })[0]
      ) {

        transferCode = creep.withdraw(
          creep.room.controller.pos.findInRange(FIND_STRUCTURES, 7, {
            filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
          })[0],
          RESOURCE_ENERGY
        );
        if(transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(
            creep.room.controller.pos.findInRange(FIND_STRUCTURES, 7, {
              filter: s => s.structureType === STRUCTURE_CONTAINER && s.store[RESOURCE_ENERGY] > 0
            })[0],
            { visualizePathStyle: { stroke: "#ffffff" } }
          );
        }
        return;
      }

      if (
        nearestStorageOrTerminal &&
        nearestStorageOrTerminal.store
      ) {
        transferCode = creep.withdraw(nearestStorageOrTerminal,RESOURCE_ENERGY);
        if(nearestStorageOrTerminal && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(nearestStorageOrTerminal, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      const nearestStoreStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: struc => {
          return (
            (struc.structureType === STRUCTURE_CONTAINER ||
              struc.structureType === STRUCTURE_TERMINAL ||
              struc.structureType === STRUCTURE_STORAGE) &&
            struc.store.energy > 0
          );
        }
      }) as StructureContainer | StructureTerminal | StructureStorage;

      if (
        creep.memory.role === "builder" &&
        nearestStoreStructure
      ) {
        transferCode = creep.withdraw(nearestStoreStructure,RESOURCE_ENERGY);
        if(nearestStoreStructure && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(nearestStoreStructure, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      if (
        creep.memory.role === "builder" &&
        droppedSources
      ) {
        transferCode = creep.pickup(droppedSources);
        if(droppedSources && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }


      if (
        creep.memory.role === "upgrader" &&
        controllerLink
      ) {
        transferCode = creep.withdraw(controllerLink, RESOURCE_ENERGY);
        if(controllerLink && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(controllerLink, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }


      const target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0;
        }
      }) as StructureStorage;

      if (target_storage) {
        transferCode = creep.withdraw(target_storage, RESOURCE_ENERGY);
        if(target_storage && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(target_storage, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      if (terminal) {
        transferCode = creep.withdraw(terminal, RESOURCE_ENERGY);
        if(terminal && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      if (
        creep.memory.role === "builder" &&
        container
      ) {
        transferCode = creep.withdraw(container, RESOURCE_ENERGY);
        if(container && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      return;
    }

    const nearestSource = creep.pos.findClosestByRange(FIND_SOURCES_ACTIVE);



    if (creep && terminal && creep.memory.extensionFarm === 3) {
      const labs: StructureLab[] = creep.room.find(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType === STRUCTURE_LAB;
        }
      });

      const target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: structure => {
          return structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0;
        }
      }) as StructureStorage;

      const canContinue = this.generalScientistGather(
        creep,
        terminal,
        commandLevel,
        labs,
        target_storage,
        nearestStorageOrTerminal
      );
      if (!canContinue) {
        return;
      }
    }



    const extensionLink = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: (struc) => {
        return struc.structureType === STRUCTURE_LINK && struc.store.energy > 0 && creep.room.find(FIND_MY_CREEPS, {
          filter: (ccc) => {
            return ccc.memory.role === 'carrier'
          }
        }).length < 4
      }
    })as StructureLink ?? null;


    let transferCode = undefined;

    const nearestStoreStructure = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: struc => {
        return (
          (struc.structureType === STRUCTURE_CONTAINER ||
            struc.structureType === STRUCTURE_TERMINAL ||
            struc.structureType === STRUCTURE_STORAGE) &&
          struc.store.energy > 0
        );
      }
    }) as StructureContainer | StructureTerminal | StructureStorage;

    if (
      creep.memory.role !== "carrier" &&
      nearestStoreStructure &&
      nearestStoreStructure.store[RESOURCE_ENERGY] >= creep.store.getCapacity()
    ) {
      transferCode = creep.withdraw(nearestStoreStructure,RESOURCE_ENERGY);
      if(nearestStoreStructure && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestStoreStructure, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (
      container &&
      container.store.energy >= creep.store.getCapacity()
    ) {
      transferCode = creep.withdraw(container,RESOURCE_ENERGY);
      if(container && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }


    const droppedTombstone =
    creep.pos.findInRange(FIND_TOMBSTONES, 4, {
      filter: tomb => {
        return tomb.store && tomb.store[RESOURCE_ENERGY] > 0;
      }
    })[0] ?? null;

    if (
      droppedTombstone &&
      droppedTombstone.store
    ) {
      transferCode = creep.withdraw(droppedTombstone,RESOURCE_ENERGY);
      if(droppedTombstone && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedTombstone, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    const droppedSources = creep.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
      filter: source => {
        return source.amount >= 50 && source.room?.controller?.my && source.resourceType === RESOURCE_ENERGY;
      }
    });

    if (
      droppedSources &&
      droppedSources.amount >= creep.store.getCapacity()
    ) {
      transferCode = creep.pickup(droppedSources);
      if(droppedSources && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (
      nearestStoreStructure &&
      nearestStoreStructure.store[RESOURCE_ENERGY] >= creep.store.getCapacity()
    ) {
      transferCode = creep.withdraw(nearestStoreStructure, RESOURCE_ENERGY);
      if(nearestStoreStructure && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(nearestStoreStructure, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    const target_storage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
      filter: structure => {
        return structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0;
      }
    }) as StructureStorage;

    if (
      target_storage &&
      creep.memory.role === "carrier" &&
      creep.memory.extensionFarm === undefined &&
      target_storage.store[RESOURCE_ENERGY] > 0
    ) {
      transferCode = creep.withdraw(target_storage, RESOURCE_ENERGY);
      if(target_storage && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(target_storage, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    const ruinsSource = creep.room.find(FIND_RUINS, {
      filter: source => {
        return source.room?.controller?.my && source.store[RESOURCE_ENERGY] > 0;
      }
    });

    if (
      ruinsSource[0] &&
      ruinsSource[0].store
    ) {
      transferCode = creep.withdraw(ruinsSource[0], RESOURCE_ENERGY);
      if(ruinsSource[0] && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(ruinsSource[0], { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (container) {
      transferCode = creep.withdraw(container, RESOURCE_ENERGY);
      if(container && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(container, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (droppedSources) {
      transferCode = creep.pickup(droppedSources);
      if(droppedSources && transferCode === ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffffff" } });
      }
      return;
    }

    if (
      terminal &&
      commandLevel >= 7 &&
      creep.memory.role === "carrier" &&
      creep.memory.extensionFarm === undefined &&
      terminal.store[RESOURCE_ENERGY] > 0 &&
      creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(terminal);
    } else if (
      creep.memory.extensionFarm === undefined &&
      nearestStorageOrTerminal &&
      creep.room.energyAvailable !== creep.room.energyCapacityAvailable &&
      creep.withdraw(nearestStorageOrTerminal, RESOURCE_ENERGY) === ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(nearestStorageOrTerminal, { visualizePathStyle: { stroke: "#ffffff" } });
    } else if (targetSource && creep.harvest(targetSource) == ERR_NOT_IN_RANGE) {
      if (!creep.pos.inRangeTo(targetSource.pos.x, targetSource.pos.y, 1)) {
        creep.moveTo(targetSource);
      }
    } else if (nearestSource && creep.harvest(nearestSource) == ERR_NOT_IN_RANGE) {
      if (!creep.pos.inRangeTo(nearestSource.pos.x, nearestSource.pos.y, 1)) {
        creep.moveTo(nearestSource);
      }
    } else if (
      terminal &&
      terminal.store[RESOURCE_ENERGY] > 3000 &&
      creep.withdraw(terminal, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(terminal);
    } else if (
      target_storage &&
      target_storage.store[RESOURCE_ENERGY] > 3000 &&
      target_storage.room.energyAvailable === target_storage.room.energyCapacityAvailable &&
      creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(target_storage, { visualizePathStyle: { stroke: "#ffffff" } });
    } else if (
        extensionLink &&
        extensionLink.store[RESOURCE_ENERGY] > 0 &&
        creep.withdraw(extensionLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(extensionLink);
    }else if (roomRallyPointFlag[0]) {
      creep.moveTo(roomRallyPointFlag[0]);
    } else {
      creep.move(MovementUtils.randomDirectionSelector());
    }
  }

  private static generalScientistGather(
    creep: Creep,
    terminal: StructureTerminal,
    commandLevel: number,
    labs: StructureLab[],
    target_storage: StructureStorage,
    nearestStorageOrTerminal: StructureTerminal | StructureStorage | null
  ): boolean {
    if (!Labs.inputLabs) {
      return true;
    }
    const inputLab1 = Labs.inputLabs[0] ?? null;
    const inputLab2 = Labs.inputLabs[1] ?? null;

    const input1Mineral = Labs.MAP.input1 as MineralCompoundConstant | MineralConstant | null;
    const input2Mineral = Labs.MAP.input2 as MineralCompoundConstant | MineralConstant | null;

    const droppedMineral = creep.room.find(FIND_DROPPED_RESOURCES)[0] ?? null;

    if (
      input1Mineral &&
      inputLab1 &&
      inputLab1.store[input1Mineral] < 2700 &&
      terminal.store[input1Mineral] > 0 &&
      creep.withdraw(terminal, input1Mineral) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffaa00" } });
    } else if (
      input2Mineral &&
      inputLab2 &&
      inputLab2.store[input2Mineral] < 2700 &&
      terminal.store[input2Mineral] > 0 &&
      creep.withdraw(terminal, input2Mineral) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffaa00" } });
    }
    else if (droppedMineral && creep.pickup(droppedMineral) == ERR_NOT_IN_RANGE) {
      creep.moveTo(droppedMineral, { visualizePathStyle: { stroke: "#ffffff" } });
    } else if (target_storage && creep.withdraw(target_storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
      creep.moveTo(target_storage, { visualizePathStyle: { stroke: "#ffffff" } });
    }
    else {
      return true;
    }

    return false;
  }

  public static callForHelp(creep: Creep) {
    const hostileCreeps = creep.room.find(FIND_HOSTILE_CREEPS, {
      filter: hostileCreep => {
        return (
          (hostileCreep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(hostileCreep.owner)) ||
          hostileCreep?.owner?.username === "Invader"
        );
      }
    });

    const hostileStructures = creep.room.find(FIND_HOSTILE_STRUCTURES, {
      filter: creep => {
        return (
          creep.owner &&
          !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner) &&
          creep.structureType !== STRUCTURE_RAMPART &&
          creep.structureType !== STRUCTURE_CONTROLLER
        );
      }
    });

    if (hostileCreeps.length > 0) {
      creep.say("📞", true);

      if (creep.memory.role === "scout" && !Game.flags.attackFlag && !creep.room.controller?.safeMode) {
        creep.room.createFlag(hostileCreeps[0].pos, "scoutFlag");
      }


      if (!Game.flags.attackFlag && !creep.room.controller?.safeMode) {
        if (hostileCreeps[0]) {
          creep.room.createFlag(hostileCreeps[0].pos, "attackFlag");
        } else if (hostileStructures[0]) {
          creep.room.createFlag(hostileStructures[0].pos, "attackFlag");
        }

        if (Game.flags.startScouting) {
          Game.flags.startScouting.remove();
        }
      }

    }
  }

  public static claimerSettlerMovementSequence(creep: Creep): boolean {

    if (Game.flags.settlerFlag && creep.memory.role === 'settler') {

      if (Game.flags.settlerFlag.room == creep.room) {
        return true;
      }

      MovementUtils.goToFlag(creep, Game.flags.settlerFlag);
      return false;

    }

    if (creep.memory.role !== "settler" && creep.memory.role !== "claimer" && creep.memory.role !== "attackClaimer") {
      return true;
    }

    if (creep.memory.role === "attackClaimer") {
      if (Game.flags.attackClaim) {
        MovementUtils.goToFlag(creep, Game.flags.attackClaim);
        if (Game.flags.attackClaim.room === creep.room && creep.pos.inRangeTo(Game.flags.attackClaim.pos, 2)) {
          return true;
        }
      } else {
        return true;
      }

      return false;
    }



    if (!!!AutoSpawn.nextClaimFlag) {
      return true;
    }

    if (AutoSpawn.nextClaimFlag.room == creep.room) {
      return true;
    }

    MovementUtils.goToFlag(creep, AutoSpawn.nextClaimFlag);
    if (!!AutoSpawn.nextClaimFlag && AutoSpawn.nextClaimFlag.room !== creep.room) {
      return false;
    }

    return true;
  }

  public static xHarvesterMovementSequence(
    creep: Creep,
    xTarget: any,
    extensionLink: any,
    storage: any,
    terminal: StructureTerminal | null
  ) {




    if (creep.memory.extensionFarm === 1) {
      const canContinue = this.dropOffInTerminal(creep, terminal);
      if (!canContinue) {
        return;
      }

      let transferCode = undefined;
      if (extensionLink) {
        transferCode = creep.withdraw(extensionLink, RESOURCE_ENERGY);
        if(extensionLink && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(extensionLink, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      const extensionsNearMe: StructureExtension[] = creep.pos.findInRange(FIND_STRUCTURES, 7, {
        filter: struc => {
          return struc.structureType === STRUCTURE_EXTENSION && struc.store[RESOURCE_ENERGY] == 0;
        }
      }) as StructureExtension[];

      if (storage &&
        extensionsNearMe.length > 0 &&
        storage.store[RESOURCE_ENERGY] > 0) {
        transferCode = creep.withdraw(storage, RESOURCE_ENERGY);
        if(storage && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      if (terminal &&
        extensionsNearMe.length > 0 &&
        creep.room.controller &&
        creep.room.controller.level >= 6 &&
        creep.memory.role === "carrier" &&
        terminal &&
        terminal.store[RESOURCE_ENERGY] > 0) {
        transferCode = creep.withdraw(terminal, RESOURCE_ENERGY);
        if(transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(terminal, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      const nearestContainer =
      creep.pos.findInRange(FIND_STRUCTURES, 4, {
        filter: struc => {
          return struc.structureType === STRUCTURE_CONTAINER && struc.store && struc.store[RESOURCE_ENERGY] > 0;
        }
      })[0] ?? null;

      if (nearestContainer) {
        transferCode = creep.withdraw(nearestContainer, RESOURCE_ENERGY);
        if(nearestContainer && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(nearestContainer, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      const droppedSources =
      creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4, {
        filter: source => {
          return source.amount >= 0 && source.room?.controller?.my && source.resourceType === RESOURCE_ENERGY;
        }
      })[0] ?? null;

      if (droppedSources) {
        transferCode = creep.pickup(droppedSources);
        if(droppedSources && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffffff" } });
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
        transferCode = creep.withdraw(droppedTombstone, RESOURCE_ENERGY);
        if(droppedTombstone && transferCode === ERR_NOT_IN_RANGE) {
          creep.moveTo(droppedTombstone, { visualizePathStyle: { stroke: "#ffffff" } });
        }
        return;
      }

      creep.moveTo(xTarget.pos.x - 3, xTarget.pos.y + 3);

      return;
    }

    if (creep.memory.extensionFarm === 2) {
      const canContinue = this.dropOffInTerminal(creep, terminal);
      if (!canContinue && terminal) {
        return;
      }

      const extensionsNearMe: StructureExtension[] = creep.pos.findInRange(FIND_STRUCTURES, 5, {
        filter: struc => {
          return struc.structureType === STRUCTURE_EXTENSION && struc.store[RESOURCE_ENERGY] == 0;
        }
      }) as StructureExtension[];




      const droppedTombstone =
      creep.pos.findInRange(FIND_TOMBSTONES, 4, {
        filter: tomb => {
          return tomb.store && tomb.store[RESOURCE_ENERGY] > 0;
        }
      })[0] ?? null;

      const droppedSources =
      creep.pos.findInRange(FIND_DROPPED_RESOURCES, 4, {
        filter: source => {
          return source.amount >= 0 && source.room?.controller?.my && source.resourceType === RESOURCE_ENERGY;
        }
      })[0] ?? null;

      if (
        extensionLink &&
        extensionLink.store[RESOURCE_ENERGY] > 0 &&
        creep.withdraw(extensionLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(extensionLink);
        return;
      } else if (
        terminal &&
        extensionsNearMe.length > 0 &&
        terminal.store[RESOURCE_ENERGY] > 0 &&
        creep.room.energyAvailable !== creep.room.energyCapacityAvailable &&
        creep.withdraw(terminal, RESOURCE_ENERGY, creep.store.getFreeCapacity()) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(terminal);
        return;
      } else if (
        storage &&
        creep.room.controller &&
        creep.room.controller.level >= 7 &&
        creep.memory.role === "carrier" &&
        storage.store[RESOURCE_ENERGY] > 0 &&
        creep.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
      ) {
        creep.moveTo(storage, { visualizePathStyle: { stroke: "#ffffff" } });
        return;
      } else if (droppedSources && creep.pickup(droppedSources) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedSources, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else if (droppedTombstone && creep.withdraw(droppedTombstone, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
        creep.moveTo(droppedTombstone, { visualizePathStyle: { stroke: "#ffaa00" } });
      } else {
        creep.moveTo(xTarget.pos.x - 3, xTarget.pos.y + 3);
      }


      return;
    }
  }

  public static returnHomeCheck(creep: Creep): boolean {
    if (
      creep.memory.role !== "miner" &&
      creep.memory.role !== "settler" &&
      creep.memory.firstSpawnCoords &&
      creep.room.name !== creep.memory.firstSpawnCoords
    ) {
      const homeRoom = Game.rooms[creep.memory.firstSpawnCoords].controller;
      if (homeRoom) {
        creep.moveTo(homeRoom?.pos);
        return false;
      }
    }
    return true;
  }

  public static strongUpgraderSequence(creep: Creep, controllerLink: any) {
    creep.moveTo(controllerLink.pos.x, controllerLink.pos.y);
    if (
      controllerLink &&
      controllerLink.store[RESOURCE_ENERGY] > 0 &&
      creep.withdraw(controllerLink, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE
    ) {
      creep.moveTo(controllerLink);
      return;
    }
  }

  public static dropOffInTerminal(creep: Creep, terminal: StructureTerminal | null): boolean {
    if (terminal && creep.store[RESOURCE_LEMERGIUM] > 0) {
      if (creep.transfer(terminal, RESOURCE_LEMERGIUM) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_ZYNTHIUM_KEANITE] > 0) {
      if (creep.transfer(terminal, RESOURCE_ZYNTHIUM_KEANITE) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_UTRIUM_LEMERGITE] > 0) {
      if (creep.transfer(terminal, RESOURCE_UTRIUM_LEMERGITE) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_HYDROGEN] > 0) {
      if (creep.transfer(terminal, RESOURCE_HYDROGEN) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_ZYNTHIUM] > 0) {
      if (creep.transfer(terminal, RESOURCE_ZYNTHIUM) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_KEANIUM] > 0) {
      if (creep.transfer(terminal, RESOURCE_KEANIUM) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_UTRIUM] > 0) {
      if (creep.transfer(terminal, RESOURCE_UTRIUM) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_GHODIUM] > 0) {
      if (creep.transfer(terminal, RESOURCE_GHODIUM) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    if (terminal && creep.store[RESOURCE_UTRIUM_HYDRIDE] > 0) {
      if (creep.transfer(terminal, RESOURCE_UTRIUM_HYDRIDE) === ERR_NOT_IN_RANGE) {
        creep.moveTo(terminal);
      }
      return false;
    }

    return true;
  }
}
