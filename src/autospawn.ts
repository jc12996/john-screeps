import { SpawnUtils } from "utils/SpawnUtils";
import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import {
  HighUpkeep,
  LowUpkeep,
  MediumUpkeep,
  PeaceTimeEconomy
} from "utils/EconomiesUtils";
import { operateLinks } from "links";
import { getNextClaimFlag } from "claims";

export class AutoSpawn {
  public static nextClaimFlag: any;
  public static nextSpawnFlag: any;

  public static run(): void {

    const spawns = Game.spawns;

    for (const spawn in spawns) {
      this.spawnSequence(Game.spawns[spawn]);
    }
  }

  private static spawnSequence(spawn: any): void {
    let bodyParts = null;
    let name = null;
    let options = undefined;

    const roomCreeps = _.filter(
      Game.creeps,
      creep => creep.room.name == spawn.room.name
    );

    const defenders = _.filter(
      Game.creeps,
      creep => creep.memory.role == "defender" && (Game.flags.draftFlag || creep.room.name == spawn.room.name)
    );
    let harvesters = _.filter(
      roomCreeps,
      creep => creep.memory.role == "harvester"
    );
    let upgraders = _.filter(
      roomCreeps,
      creep => creep.memory.role == "upgrader"
    );
    let builders = _.filter(
      roomCreeps,
      creep => creep.memory.role == "builder"
    );
    const repairers = _.filter(
      roomCreeps,
      creep => creep.memory.role == "repairer"
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
    let carriers = _.filter(
      roomCreeps,
      creep => creep.memory.role == "carrier"
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
      spawn.room.memory?.numberOfNeededHarvestorSlots === undefined && harvesters.length === 0
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
    const extensionFarm2Flag = spawn.room.find(FIND_FLAGS,{
      filter: (fff:any) => fff.color === COLOR_PURPLE
    })[0]?? null
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

    if (commandLevel >= 3) {
      if (energyCapacityAvailable >= 2000 && numberOfNeededUpgraders > 6) {
        numberOfNeededUpgraders = 6;
      } else if (energyCapacityAvailable >= 550 && numberOfNeededUpgraders >= 4) {
        numberOfNeededUpgraders = 8;
      }
    }

    // if (harvesters.length < upgraders.length) {
    //   numberOfNeededUpgraders = 2;
    // }

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

    if (commandLevel >= 8 && numberOfNeededCarriers >= 3) {
      numberOfNeededCarriers = 3;
    }

    if (commandLevel >= 4 && numberOfNeededUpgraders >= 6) {
      numberOfNeededUpgraders = 6;
    }

    if (commandLevel >= 8) {
      numberOfNeededUpgraders = 1;
    }

    if (commandLevel >= 8 && Game.flags.draftFlag) {
      numberOfNeededDefenders = numberOfNeededDefenders + LowUpkeep.TOTALDRAFT;
    }

    const totalNumberOfControlledRooms = _.filter(Game.rooms, room => room.controller?.my).length;

    var hostileCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);



    let isSquadPatrol = (commandLevel >= 5 && Game.flags.rallyFlag) || Game.flags.SquadFlag;


    if(harvesters.length >= 2 && carriers.length >= 2 && harvesters.some(harvester => harvester.getActiveBodyparts(WORK) >= maxNeededWorkParts)){
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
        let numberOfNeededMiners = numberOfSourcesInMineFlagRoom >= 2 ? 2 : 1;
        //let numberOfNeededMiners = numberOfSourcesInMineFlagRoom >= 2 && mineFlag.room?.find(FIND_FLAGS).length === 1 ? 3 : 1;

        let numberOfNeededHaulers = numberOfSourcesInMineFlagRoom >= 2 ? 4 : 2;
        let numberOfNeededAttackClaimers = LowUpkeep.AttackClaimers * 1;
/*
        if(numberOfActiveSourcesInMineFlagRoom == 0) {
          numberOfNeededMiners = 0;
          numberOfNeededHaulers = numberOfSourcesInMineFlagRoom * 2;
        }*/


        // Check if any attackClaimer has 100 ticks or less left to live
        const needsNewAttackClaimer = attackClaimers.some(
          creep => creep.ticksToLive && creep.ticksToLive <= 100 && creep.memory.assignedMineFlag == mineFlag.name
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
            mineFlag.room?.find(FIND_STRUCTURES).filter(structure => structure.structureType === STRUCTURE_CONTAINER && structure.store.energy > 0)
              ?.length ?? 0;

          if (
            mineFlags.length > 0 &&
            mineFlag.room?.controller &&
            commandLevel >= 3 &&
            energyAvailable >= 650 &&
            currentRoomCreepCounts.miners > 0 &&
            currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers &&
            !mineFlag.room.controller.my &&
            currentRoomCreepCounts.attackClaimers < 2
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
            !mineFlag.room?.controller.my &&
            ((needsNewAttackClaimer && currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers + 1) ||
              currentRoomCreepCounts.attackClaimers < numberOfNeededAttackClaimers) &&
              currentRoomCreepCounts.attackClaimers < 2
          ) {
            name = "AttackClaimer" + "_" + mineFlag.name + "_" + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype("attackClaimer", spawn, commandLevel);
            options = { memory: { role: "attackClaimer", assignedMineFlag: mineFlag.name } };
            gotOne = true;
          } else if (
            mineFlags.length > 0 &&
            commandLevel >= 2 &&
            energyCapacityAvailable >= 450 &&
            currentRoomCreepCounts.miners < numberOfNeededMiners &&
            (!mineFlag.room?.controller?.owner || (mineFlag.room?.controller?.owner && mineFlag.room?.controller?.owner.username === 'Xarroc'))
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
            (currentRoomCreepCounts.miners >= numberOfNeededMiners || currentRoomCreepCounts.miners >= 2) &&
            mineFlag.room?.find(FIND_STRUCTURES).some(structure => structure.structureType === STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 0) &&
            (!mineFlag.room?.controller?.owner || (mineFlag.room?.controller?.owner && mineFlag.room?.controller?.owner.username === 'Xarroc'))
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

    if (Game.flags.startScouting && isSquadPatrol) {
      isSquadPatrol = Game.flags.scoutFlag || Game.flags.attackFlag;
    }

    if (commandLevel >= 6 && carriers.length >= 3) {
        numberOfNeededCarriers = 3 + upgraders.length;
        if(numberOfNeededCarriers >= 8) {
          numberOfNeededCarriers = 8;
        }
    }


    if(numberOfNeededUpgraders >= 4 && commandLevel >= 5) {
      numberOfNeededUpgraders = 4;
    }

    if(numberOfNeededUpgraders >= 8) {
      numberOfNeededUpgraders = 8;
    }

    if(numberOfNeededHarvesters >= 8) {
      numberOfNeededHarvesters = 8;
    }

    if(numberOfNeededCarriers >= 4 && commandLevel >= 6) {
      numberOfNeededCarriers = 4;
    }


    if(numberOfNeededCarriers >= 8) {
      numberOfNeededCarriers = 8;
    }

    if(spawn.energyCapacity > 1700 && numberOfNeededUpgraders >= 4) {
      numberOfNeededUpgraders = 4;
    }

    if(spawn.energyCapacityAvailable > 1700 && commandLevel >= 6 && numberOfNeededUpgraders >= 1) {
      numberOfNeededUpgraders = 1;
    }


    if(numberOfNeededHarvesters >= RoomSources.length && commandLevel >= 6) {
      numberOfNeededHarvesters = RoomSources.length >=  2 ?  RoomSources.length : 2;
    }

    if(RoomSources.length === 1) {
      if(numberOfNeededUpgraders >= 1) {
        numberOfNeededUpgraders = 1;
      }
      if(numberOfNeededHarvesters >= 2) {
        numberOfNeededHarvesters = 2;
      }
      if(numberOfNeededRepairers >= 1 && commandLevel <= 4 && energyAvailable < 800) {
          numberOfNeededRepairers = 0;
      }

      if(numberOfNeededCarriers >= 1 && commandLevel <= 4 && energyAvailable < 800) {
        numberOfNeededCarriers = 1;
      }

    }


    // if(spawn.room.name === 'E28S37') {
    //   spawn.room.memory.numberOfNeededHarvestorSlots = 2
    //   numberOfNeededHarvesters = 2;
    //   console.log('numberOfNeededHarvesters',numberOfNeededHarvesters)
    // }
    //Suicide scripts

    if(energyCapacityAvailable >= 500 && energyAvailable >= 500) {
      let suicideOccured = false
      if( harvesters.length > 0 && numberOfNeededHarvesters > 0 && numberOfNeededHarvesters === harvesters.length && suicideOccured === false) {
        const lowHarvestor = harvesters.filter(harv => {
          return harv.getActiveBodyparts(WORK) <= 1
        })[0] ?? null;

        if(lowHarvestor) {
          console.log('suicide harvest!')
          suicideOccured = true;
          lowHarvestor.suicide();
          harvesters = _.filter(
            Game.creeps,
            creep => creep.memory.role == "harvester" && creep.room.name == spawn.room.name
          );
        }
      }

      if( carriers.length > 0 && numberOfNeededCarriers > 0 && numberOfNeededCarriers === carriers.length && suicideOccured === false) {
        const lowCarrier = carriers.filter(harv => {
          return harv.getActiveBodyparts(CARRY) <= 3
        })[0] ?? null;

        if(lowCarrier) {
          console.log('suicide carry!')
          suicideOccured = true;
          lowCarrier.suicide();
          carriers = _.filter(
            Game.creeps,
            creep => creep.memory.role == "carrier" && creep.room.name == spawn.room.name
          );
        }
      }

      if( upgraders.length > 0 && numberOfNeededUpgraders > 0 && numberOfNeededUpgraders === upgraders.length && suicideOccured === false) {
        const lowUpgrade = upgraders.filter(harv => {
          return harv.getActiveBodyparts(WORK) <= 2
        })[0] ?? null;

        if(lowUpgrade) {
          console.log('suicide upgrade!')
          suicideOccured = true;
          lowUpgrade.suicide();
          upgraders = _.filter(
            Game.creeps,
            creep => creep.memory.role == "upgrader" && creep.room.name == spawn.room.name
          );
        }
      }

      if( builders.length > 0 && numberOfNeededBuilders > 0 && numberOfNeededBuilders === builders.length && suicideOccured === false) {
        const lowUpgrade = builders.filter(harv => {
          return harv.getActiveBodyparts(WORK) <= 2
        })[0] ?? null;

        if(lowUpgrade) {
          console.log('suicide builder!')
          suicideOccured = true;
          lowUpgrade.suicide();
          builders = _.filter(
            Game.creeps,
            creep => creep.memory.role == "builder" && creep.room.name == spawn.room.name
          );
        }
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
      carriers.length <= RoomSources.length ||
      (carriers.length <= RoomSources.length && carriers[0].ticksToLive && carriers[0].ticksToLive <= 100)
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
      upgraders.length == 0 ||
      (upgraders.length == 1 && upgraders[0].ticksToLive && upgraders[0].ticksToLive <= 100)
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
      commandLevel < 6 &&
      spawn.room.energyCapacityAvailable > 250 &&
      hostileCreeps.length == 0 &&
      carriers.length >= 2 &&
      upgraders.length < numberOfNeededUpgraders
    ) {
      name = "Upgrader" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("upgrader", spawn, commandLevel);
      options = { memory: { role: "upgrader" } };
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
      repairableStuff.length &&
      numberOfNeededRepairers > 0 &&
      repairers.length < numberOfNeededRepairers
    ) {
      name = "Repairer" + Game.time + 1;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("repairer", spawn, commandLevel);
      options = { memory: { role: "repairer" } };
    } else if (
      hostileCreeps.length == 0 &&
      claimers.length < LowUpkeep.Claimers &&
      harvesters.length >= numberOfNeededHarvesters &&
      carriers.length >= numberOfNeededCarriers &&
      (!Game.flags.claimFromFlag || (Game.flags.claimFromFlag && Game.flags.claimFromFlag.room?.name === spawn.room.name)) &&
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

      commandLevel >= 6 &&
      ((
      Game.flags.startScouting &&
      Game.flags.rallyFlag2 &&
      !Game.flags.scoutFlag) || Game.flags['1']) &&
      scouts.length < PeaceTimeEconomy.TOTAL_SCOUT_SIZE
    ) {
      name = "Scout" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("scout", spawn, commandLevel);
      options = { memory: { role: "scout", isArmySquad: true } };
    } else if (
      !Game.flags.SquadFlag && (hostileCreeps.length > 0) &&
      (defenders.length < numberOfNeededDefenders || (Game.flags.draftFlag && defenders.length < LowUpkeep.TOTALDRAFT))
    ) {
      name = "Defender" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("defender", spawn, commandLevel);
      options = { memory: { role: "defender" } };
    } else if (isSquadPatrol && attackers.length < SpawnUtils.TOTAL_ATTACKER_SIZE) {
      name = "Attacker" + Game.time;
      bodyParts = SpawnUtils.getBodyPartsForArchetype("attacker", spawn, commandLevel);
      if(attackers.length % 2) {
        name = "Shooter" + Game.time;
        bodyParts = SpawnUtils.getBodyPartsForArchetype("shooter", spawn, commandLevel);
      }
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
    }  else if (
      commandLevel < 6 &&
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
      if (SpawnUtils.SHOW_VISUAL_CREEP_ICONS && Game.time % 7) {
        console.log(spawn.name + " spawning new creep: " + spawningCreep.name);
      }
      spawn.room.visual.text("🛠️" + spawningCreep.memory.role, spawn.pos.x + 1, spawn.pos.y, {
        align: "left",
        opacity: 0.8
      });
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
