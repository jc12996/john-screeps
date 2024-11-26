import { SpawnUtils } from "utils/SpawnUtils";
import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import {
  HighUpkeep,
  LowUpkeep,
  MediumUpkeep,
  PeaceTimeEconomy,
  SeigeEconomy,
  WarTimeEconomy
} from "utils/EconomiesUtils";
import { operateLinks } from "links";
import { getNextClaimFlag } from "claims";

export class AutoSpawn {
  public static nextClaimFlag: any;
  public static nextSpawnFlag: any;
  public static totalSpawns: number;

  public static run(): void {
    const roomsWithSpawns = _.filter(Game.rooms, room => {
      return room.find(FIND_MY_SPAWNS)?.length > 0;
    });

    this.totalSpawns = 0;
    roomsWithSpawns.forEach(roomWithSpawn => {
      const spawnsInRoom = roomWithSpawn.find(FIND_MY_SPAWNS);
      if (spawnsInRoom.length > 0) {
        for (const spawn of spawnsInRoom) {
          this.totalSpawns++;
          this.spawnSequence(spawn);
        }
      }
    });
  }

  private static spawnSequence(spawn: any): void {
    let bodyParts = null;
    let name = null;
    let options = undefined;

    const defenders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "defender" && (Game.flags.draftFlag || creep.room.name == spawn.room.name)
    );
    const harvesters = _.filter(
      Game.creeps,
      creep => creep.memory.role == "harvester" && creep.room.name == spawn.room.name
    );
    const upgraders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "upgrader" && creep.room.name == spawn.room.name
    );
    const builders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "builder" && creep.room.name == spawn.room.name
    );
    const repairers = _.filter(
      Game.creeps,
      creep => creep.memory.role == "repairer" && creep.room.name == spawn.room.name
    );
    const attackers = _.filter(Game.creeps, creep => creep.memory.role == "attacker");
    const scouts = _.filter(Game.creeps, creep => creep.memory.role == "scout");
    const meatGrinders = _.filter(Game.creeps, creep => creep.memory.role == "meatGrinder");
    const settlers = _.filter(Game.creeps, creep => creep.memory.role == "settler");
    const claimers = _.filter(Game.creeps, creep => creep.memory.role == "claimer");
    const healers = _.filter(Game.creeps, creep => creep.memory.role == "healer");

    const mineFlags = _.filter(Game.flags, flag => flag.name.startsWith(spawn.room.name + "MineFlag"));
    // console.log(mineFlags);

    if (!spawn.memory.firstSpawnCoords) {
      spawn.memory.firstSpawnCoords = spawn.room.name;
    }

    const dismantlers = _.filter(Game.creeps, creep => creep.memory.role == "dismantler");
    const carriers = _.filter(
      Game.creeps,
      creep => creep.memory.role == "carrier" && creep.room.name == spawn.room.name
    );
    const repairableStuff = spawn.room.find(FIND_STRUCTURES, {
      filter: (site: { structureType: string; store: { [x: string]: number } }) => {
        return (
          site.structureType == STRUCTURE_CONTAINER ||
          site.structureType === STRUCTURE_RAMPART ||
          site.structureType === STRUCTURE_ROAD
        );
      }
    });
    const RoomSources = spawn.room.find(FIND_SOURCES);
    const ActiveRoomSources = spawn.room.find(FIND_SOURCES_ACTIVE);
    const commandLevel = spawn.room?.controller?.level ?? 1;
    const energyAvailable = spawn.room.energyAvailable;
    const energyCapacityAvailable = spawn.room.energyCapacityAvailable;
    const maxNeededWorkParts = 3;

    if (
      spawn.room.memory?.numberOfNeededHarvestorSlots === undefined ||
      spawn.room.memory.numberOfNeededHarvestorSlots == 0
    ) {
      spawn.room.memory.numberOfNeededHarvestorSlots =
        RoomUtils.getTotalAmountOfProspectingSlotsInRoomBySpawnOrFlag(spawn);
      console.log(
        spawn.room.name,
        "numberOfNeededHarvesters to memory ",
        spawn.room.memory.numberOfNeededHarvestorSlots
      );
    }

    if (commandLevel >= 5 && spawn.room.memory.numberOfNeededHarvestorSlots < 3) {
      spawn.room.memory.numberOfNeededHarvestorSlots = 3;
    }

    let numberOfNeededHarvesters = spawn.room.memory?.numberOfNeededHarvestorSlots ?? RoomSources.length;

    const storage =
      spawn.room.find(FIND_STRUCTURES, {
        filter: { structureType: STRUCTURE_STORAGE }
      })[0] ?? undefined;
    const extensionFarm2Flag = Game.flags[spawn.room.name + "ExtensionFarm2"];
    const labFarmFlag = Game.flags[spawn.room.name + "LabFarm"];

    var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
    const extensions = spawn.room.find(FIND_MY_STRUCTURES, {
      filter: { structureType: STRUCTURE_EXTENSION }
    });
    const nonactiveharvesters = harvesters.filter(hhh => !hhh.memory?.targetSource);

    let numberOfNeededCarriers = LowUpkeep.Carriers * harvesters.length;
    let numberOfNeededBuilders = LowUpkeep.Builder * 1;
    let numberOfNeededRepairers = LowUpkeep.Repairer * 1;
    let numberOfNeededUpgraders = LowUpkeep.Upgrader * RoomSources.length;
    let numberOfNeededSettlers = LowUpkeep.Settlers * 1;
    let numberOfNeededDefenders = !!Game.flags.draftFlag ? LowUpkeep.DraftedDefenderTotal * 1 : LowUpkeep.Defender * 1;

    this.nextClaimFlag = getNextClaimFlag(spawn.room, extensionFarm2Flag);
    operateLinks(spawn);

    if (commandLevel == 8) {
      numberOfNeededCarriers = 4;
    }

    if (storage) {
      if (storage.store[RESOURCE_ENERGY] > 50000) {
        numberOfNeededCarriers = MediumUpkeep.Carriers * harvesters.length;
        numberOfNeededUpgraders = MediumUpkeep.Upgrader * RoomSources.length;
        numberOfNeededBuilders = MediumUpkeep.Builder * 1;
        numberOfNeededRepairers = MediumUpkeep.Repairer * 1;
        numberOfNeededDefenders = numberOfNeededDefenders + MediumUpkeep.AdditionalDraftedDefenders;
        numberOfNeededSettlers = MediumUpkeep.Settlers;
        //console.log(`Medium Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
      } else if (storage.store[RESOURCE_ENERGY] > 400000) {
        numberOfNeededCarriers = HighUpkeep.Carriers * harvesters.length;
        numberOfNeededUpgraders = HighUpkeep.Upgrader * RoomSources.length;
        numberOfNeededBuilders = HighUpkeep.Builder * 1;
        numberOfNeededRepairers = HighUpkeep.Repairer * 1;
        numberOfNeededSettlers = HighUpkeep.Settlers;
        numberOfNeededDefenders = numberOfNeededDefenders + HighUpkeep.AdditionalDraftedDefenders;
        //console.log(`High Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
      }
    }

    if (commandLevel >= 4) {
      const numberOfEnergyContainers = spawn.room.find(FIND_STRUCTURES, {
        filter: (struc: any) => {
          return struc.structureType === STRUCTURE_CONTAINER && struc.store[RESOURCE_ENERGY] > 500;
        }
      }) as StructureConstant[];

      if (numberOfEnergyContainers.length > 0) {
        const carrierMultiplier = numberOfEnergyContainers.length * 0.25;
        numberOfNeededCarriers = LowUpkeep.Carriers * (1 + carrierMultiplier) * harvesters.length;
      }
    }

    if (commandLevel >= 7) {
      numberOfNeededDefenders = 0;
      if (commandLevel === 7) {
        numberOfNeededUpgraders = numberOfNeededUpgraders * 1.1;
      }
    }

    if (commandLevel >= 6) {
      if (energyCapacityAvailable >= 2000 && numberOfNeededUpgraders > 6) {
        numberOfNeededUpgraders = 6;
      } else if (energyCapacityAvailable >= 800 && numberOfNeededUpgraders > 4) {
        numberOfNeededUpgraders = 4;
      }
    }

    if (harvesters.length < upgraders.length) {
      numberOfNeededUpgraders = 2;
    }

    if (harvesters.length <= builders.length) {
      numberOfNeededBuilders = 0;
    }

    if (commandLevel >= 5 && numberOfNeededCarriers >= 5) {
      numberOfNeededCarriers = 5;
    }


    if (commandLevel >= 6 && numberOfNeededCarriers >= 8) {
      numberOfNeededCarriers = 8;
    }

    if (commandLevel >= 7 && energyAvailable > 1000 && energyCapacityAvailable > 1000 && numberOfNeededCarriers >= 4) {
      numberOfNeededCarriers = 4;
      if (energyAvailable > 2000) {
        numberOfNeededCarriers = 6;
      }
    }

    if (
      commandLevel >= 7 &&
      energyAvailable > 1000 &&
      energyCapacityAvailable > 1000 &&
      numberOfNeededHarvesters >= 6
    ) {
      numberOfNeededHarvesters = numberOfNeededHarvesters - 2;
    }

    if (commandLevel >= 8 && numberOfNeededCarriers >= 3) {
      numberOfNeededCarriers = 3;
    }

    if (commandLevel >= 6 && numberOfNeededUpgraders >= 8) {
      numberOfNeededUpgraders = 8;
    }

    if (commandLevel >= 8) {
      numberOfNeededUpgraders = 1;
    }

    if (commandLevel >= 8 && Game.flags.draftFlag) {
      numberOfNeededDefenders = numberOfNeededDefenders + LowUpkeep.TOTALDRAFT;
    }

    const totalNumberOfControlledRooms = _.filter(Game.rooms, room => room.controller?.my).length;

    var hostileCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);



    let isSquadPatrol = (commandLevel >= 7 && Game.flags.rallyFlag) || Game.flags.SquadFlag;


        if(harvesters.length >= 2 && carriers.length >= 3 && harvesters.some(harvester => harvester.getActiveBodyparts(WORK) >= maxNeededWorkParts)){
            mineFlags.forEach(mineFlag => {
                const assignedCreeps = _.filter(Game.creeps, (creep) => {
                    if (!mineFlag) {
                        return false;
                    }
                    const mineFlagRoom = mineFlag.room;
                    return (
                        creep.memory.assignedMineFlag == mineFlag.name
                        &&
                        (
                            creep.room.name == spawn.room.name ||
                            (
                                mineFlagRoom &&
                                creep.room.name == mineFlagRoom.name
                            )
                        )
                    );
                });

        const attackClaimers = assignedCreeps.filter(creep => creep.memory.role == "attackClaimer");
        const numberOfActiveSourcesInMineFlagRoom = mineFlag.room?.find(FIND_SOURCES_ACTIVE).length ?? 1;
        const numberOfSourcesInMineFlagRoom = mineFlag.room?.find(FIND_SOURCES).length ?? 1;

        // Process each mineFlag as needed
        // Example: Adjust number of needed miners and haulers based on each mineFlag
        let numberOfNeededMiners = numberOfActiveSourcesInMineFlagRoom;
        let numberOfNeededHaulers = numberOfNeededMiners;
        let numberOfNeededAttackClaimers = LowUpkeep.AttackClaimers * 1;

        if(numberOfActiveSourcesInMineFlagRoom == 0) {
          numberOfNeededMiners = 0;
          numberOfNeededHaulers = numberOfSourcesInMineFlagRoom * 2;
        }

        // Check if any attackClaimer has 100 ticks or less left to live
        const needsNewAttackClaimer = attackClaimers.some(
          creep => creep.ticksToLive && creep.ticksToLive <= 300 && creep.memory.assignedMineFlag == mineFlag.name
        );

        if (numberOfNeededMiners > 0 || numberOfNeededHaulers > 0 || numberOfNeededAttackClaimers > 0) {
          let bodyParts = null;
          let name = null;
          let options = undefined;
          let gotOne = false;

          const roomCreeps = _.groupBy(Game.creeps, creep => creep.memory.assignedMineFlag);
          const roomCreepCounts = _.mapValues(roomCreeps, creeps => ({
            miners: creeps.filter(creep => creep.memory.role === "miner" && !creep.memory.hauling).length,
            haulers: creeps.filter(creep => creep.memory.role === "miner" && creep.memory.hauling).length,
            attackClaimers: creeps.filter(creep => creep.memory.role === "attackClaimer").length
          }));

          const currentRoomCreepCounts = roomCreepCounts[mineFlag.name] || {
            miners: 0,
            haulers: 0,
            attackClaimers: 0
          };

          const numberOfContainers =
            mineFlag.room?.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_CONTAINER)
              ?.length ?? 0;

          if (
            mineFlags.length > 0 &&
            mineFlag.room?.controller &&
            commandLevel >= 3 &&
            energyAvailable >= 650 &&
            currentRoomCreepCounts.miners > 0 &&
            currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers
          ) {
            name = "AttackClaimer" + "_" + mineFlag.name + "_" + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype("attackClaimer", spawn, commandLevel);
            options = { memory: { role: "attackClaimer", assignedMineFlag: mineFlag.name } };
            gotOne = true;
          } else if (
            mineFlags.length > 0 &&
            mineFlag.room?.controller &&
            commandLevel >= 3 &&
            energyAvailable >= 650 &&
            currentRoomCreepCounts.miners > 0 &&
            ((needsNewAttackClaimer && currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers + 1) ||
              currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers)
          ) {
            name = "AttackClaimer" + "_" + mineFlag.name + "_" + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype("attackClaimer", spawn, commandLevel);
            options = { memory: { role: "attackClaimer", assignedMineFlag: mineFlag.name } };
            gotOne = true;
          } else if (
            mineFlags.length > 0 &&
            commandLevel >= 2 &&
            energyCapacityAvailable >= 450 &&
            currentRoomCreepCounts.miners < numberOfNeededMiners
          ) {
            name = "Miner" + "_" + mineFlag.name + "_" + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype("miner", spawn, commandLevel);
            options = { memory: { role: "miner", assignedMineFlag: mineFlag.name } };
            gotOne = true;
          } else if (
            mineFlags.length > 0 &&
            commandLevel >= 2 &&
            energyCapacityAvailable >= 450 &&
            currentRoomCreepCounts.haulers < numberOfNeededHaulers &&
            numberOfContainers > 0 &&
            currentRoomCreepCounts.miners >= numberOfNeededMiners &&
            mineFlag.room?.find(FIND_STRUCTURES).some(structure => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0)
          ) {
            name = "Hauler" + "_" + mineFlag.name + "_" + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype("miner", spawn, commandLevel, true);
            options = { memory: { role: "miner", hauling: true, assignedMineFlag: mineFlag.name } };
            gotOne = true;
          }

          if (gotOne) {
            this.startSpawningSequence(
              spawn,
              name,
              bodyParts,
              options,
              energyAvailable,
              extensionFarm2Flag,
              labFarmFlag
            );
          }
        }
      });
    }

    if (harvesters.length > 3 && commandLevel >= 3 && numberOfNeededHarvesters > 0) {
      numberOfNeededHarvesters = numberOfNeededHarvesters - 1;

    }
    if (Game.flags.startScouting && isSquadPatrol) {
      isSquadPatrol = Game.flags.scoutFlag || Game.flags.attackFlag;
    }

    if (commandLevel >= 6 && carriers.length >= 3) {
        numberOfNeededCarriers = 3 + upgraders.length;
        if(numberOfNeededCarriers >= 8) {
          numberOfNeededCarriers = 8;
        }
    }


    if (
      (harvesters.length == 0 ||
        (harvesters.length == 1 && harvesters[0].ticksToLive && harvesters[0].ticksToLive <= 100)) &&
      nonactiveharvesters.length == 0 &&
      commandLevel < 7
    ) {
      name = "Harvester" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("harvester", spawn, commandLevel);
      options = { memory: { role: "harvester" } };
    } else if (
      carriers.length == 0 ||
      (carriers.length == 1 && carriers[0].ticksToLive && carriers[0].ticksToLive <= 100)
    ) {
      name = "Carrier" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("carrier", spawn, commandLevel);
      options = { memory: { role: "carrier" } };
    } else if (
      numberOfNeededHarvesters > 0 &&
      harvesters.length < numberOfNeededHarvesters &&
      ActiveRoomSources.length > 0
    ) {
      name = "Harvester" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("harvester", spawn, commandLevel, numberOfNeededHarvesters);
      options = { memory: { role: "harvester" } };
    } else if (
      spawn.room.energyCapacityAvailable > 250 &&
      hostileCreeps.length == 0 &&
      carriers.length >= 2 &&
      upgraders.length < numberOfNeededUpgraders
    ) {
      name = "Upgrader" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("upgrader", spawn, commandLevel);
      options = { memory: { role: "upgrader" } };
    } else if (
      !spawn.spawning &&
      harvesters.some(harvester => harvester.getActiveBodyparts(WORK) >= maxNeededWorkParts) &&
      numberOfNeededCarriers > 0 &&
      carriers.length < numberOfNeededCarriers &&
      ActiveRoomSources.length > 0
    ) {
      name = "Carrier" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("carrier", spawn, commandLevel);
      options = { memory: { role: "carrier" } };
    } else if (
      hostileCreeps.length == 0 &&
      spawn.room.controller.level >= 2 &&
      constructionSites.length &&
      numberOfNeededBuilders > 0 &&
      builders.length < numberOfNeededBuilders &&
      RoomSources.length > 0
    ) {
      name = "Builder" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("builder", spawn, commandLevel);
      options = { memory: { role: "builder" } };
    } else if (
      hostileCreeps.length == 0 &&
      claimers.length < LowUpkeep.Claimers &&
      harvesters.length >= numberOfNeededHarvesters &&
      carriers.length >= numberOfNeededCarriers &&
      harvesters.some(harvester => harvester.getActiveBodyparts(WORK) >= maxNeededWorkParts) &&
      !!this.nextClaimFlag &&
      totalNumberOfControlledRooms < Game.gcl.level &&
      !this.nextClaimFlag.room?.controller?.my &&
      !this.nextClaimFlag.room?.controller?.owner
    ) {
      name = "Claimer" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("claimer", spawn, commandLevel);
      options = { memory: { role: "claimer" } };
    } else if (
      hostileCreeps.length == 0 &&
      settlers.length < LowUpkeep.Settlers &&
      harvesters.some(harvester => harvester.getActiveBodyparts(WORK) >= maxNeededWorkParts) &&
      ((!!this.nextClaimFlag &&
        this.nextClaimFlag.room?.controller?.my &&
        this.nextClaimFlag.room.find(FIND_HOSTILE_CREEPS).length == 0) ||
        Game.flags.settlerFlag)
    ) {
      name = "Settler" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("settler", spawn, commandLevel);
      options = { memory: { role: "settler" } };
    } else if (
      Game.flags.startScouting &&
      commandLevel >= 7 &&
      Game.flags.rallyFlag2 &&
      !Game.flags.scoutFlag &&
      scouts.length < PeaceTimeEconomy.TOTAL_SCOUT_SIZE
    ) {
      name = "Scout" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("scout", spawn, commandLevel);
      options = { memory: { role: "scout", isArmySquad: true } };
    } else if (
      !Game.flags.SquadFlag &&
      (defenders.length < numberOfNeededDefenders || (Game.flags.draftFlag && defenders.length < LowUpkeep.TOTALDRAFT))
    ) {
      name = "Defender" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("defender", spawn, commandLevel);
      options = { memory: { role: "defender" } };
    } else if (isSquadPatrol && attackers.length < SpawnUtils.TOTAL_ATTACKER_SIZE) {
      name = "Attacker" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("attacker", spawn, commandLevel);
      options = { memory: { role: "attacker", isArmySquad: true } };
    } else if (isSquadPatrol && dismantlers.length < SpawnUtils.TOTAL_DISMANTLER_SIZE) {
      name = "Dismantler" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("dismantler", spawn, commandLevel);
      options = { memory: { role: "dismantler", isArmySquad: true } };
    } else if (isSquadPatrol && healers.length < SpawnUtils.TOTAL_HEALER_SIZE) {
      name = "Healer" + Game.time;

      const leadHealer = Game.creeps["LeadHealer"];
      if (healers.length == 0 || !leadHealer) {
        name = "LeadHealer";
      }
      bodyParts = SpawnUtils.getBodyPartsForArchetype("healer", spawn, commandLevel);
      options = { memory: { role: "healer", isArmySquad: true } };
    } else if (isSquadPatrol && !Game.flags.rallyFlag2 && meatGrinders.length < SpawnUtils.TOTAL_MEAT_GRINDERS) {
      name = "MeatGrinder" + Game.time + 1;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("meatGrinder", spawn, commandLevel);
      options = { memory: { role: "meatGrinder", isArmySquad: true } };
    } else if (
      repairableStuff.length &&
      numberOfNeededRepairers > 0 &&
      repairers.length < numberOfNeededRepairers &&
      ActiveRoomSources.length > 0
    ) {
      name = "Repairer" + Game.time + 1;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("repairer", spawn, commandLevel);
      options = { memory: { role: "repairer" } };
    } else if (
      spawn.room.energyAvailable > 400 &&
      hostileCreeps.length == 0 &&
      (spawn.room.controller.level < 2 || extensions.length >= 4) &&
      (upgraders.length < numberOfNeededUpgraders || upgraders.length == 0)
    ) {
      name = "Upgrader" + Game.time + 1;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("upgrader", spawn, commandLevel);
      options = { memory: { role: "upgrader" } };
    }
    // console.log(spawn, name, bodyParts, options, energyAvailable, extensionFarm2Flag, labFarmFlag);
    this.startSpawningSequence(spawn, name, bodyParts, options, energyAvailable, extensionFarm2Flag, labFarmFlag);
  }

  private static startSpawningSequence(
    spawn: StructureSpawn,
    name: string | null,
    bodyParts: BodyPartConstant[] | null,
    options: SpawnOptions | undefined,
    energyAvailable: number,
    extensionFarm2Flag: Flag,
    labFarmFlag: Flag
  ) {
    if (spawn && spawn.spawning) {
      var spawningCreep = Game.creeps[spawn.spawning.name];
      if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
        console.log(spawn.name + " spawning new creep: " + spawningCreep.name);
      }
      spawn.room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: "left",
        opacity: 0.8
      });

      if (spawn.room.controller && spawn.room.controller.my && !!spawn) {
        ScaffoldingUtils.createExtensionFarm1(spawn);
        if (spawn.room.controller.level >= 5 && !!extensionFarm2Flag) {
          ScaffoldingUtils.createExtensionFarm2(spawn, extensionFarm2Flag);
        }

        if (spawn.room.controller.level >= 6 && !!labFarmFlag) {
          ScaffoldingUtils.createLabFarm(spawn, labFarmFlag);
        }
      }
    } else if (bodyParts != null && name != null) {
      let spawnResult = spawn.spawnCreep(bodyParts, name, options);

      if (spawnResult !== 0) {
        let spawnErrorMsg = "";
        switch (spawnResult) {
          case -3:
            spawnErrorMsg = "NAME EXISTS FOR " + name;
            break;
          case -6:
            spawnErrorMsg = "NOT ENOUGH ENERGY of " + energyAvailable + " for " + bodyParts;
            break;
          case -10:
            spawnErrorMsg = "ERR_INVALID_ARGS: " + bodyParts.length;
            break;
          default:
            spawnErrorMsg = "Spawn error" + spawnResult;
            break;
        }
        console.log(`SPAWN ERROR CODE FOR ${spawn.name}`, spawnErrorMsg);
      }
    }
  }
}
