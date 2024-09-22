import { ErrorMapper } from "utils/ErrorMapper";
import { Harvester } from "roles/harvester";
import { Upgrader } from "roles/upgrader";
import { Defender } from "roles/defender";
import { Builder } from "roles/builder";
import { AutoSpawn } from "autospawn";
import { Repairer } from "roles/repairer";
import { Attacker } from "roles/attacker";
import { Settler } from "roles/settler";
import { Tower } from "tower";
import { Claimer } from "roles/claimer";
import { Healer } from "roles/healer";
import { Dismantler } from "roles/dismantler";
import { MeatGrinder } from "roles/meatGrinder";
import { Carrier } from "roles/carrier";
import { handleRamparts } from "ramparts";
import { PeaceTimeEconomy, SeigeEconomy, WarTimeEconomy } from "utils/EconomiesUtils";
import { SpawnUtils } from "utils/SpawnUtils";
import { Miner } from "roles/miner";
import { sendEnergyFromSpawn1, transferEnergyToSpawn1Room } from "links";
import { RoomUtils } from "utils/RoomUtils";
import { Scout } from "roles/scout";
import { MovementUtils } from "utils/MovementUtils";

declare global {
  /*
    Example types, expand on these or remove them and add your own.
    Note: Values, properties defined here do no fully *exist* by this type definiton alone.
          You must also give them an implemention if you would like to use them. (ex. actually setting a `role` property in a Creeps memory)

    Types added in this `global` block are in an ambient, global context. This is needed because `main.ts` is a module file (uses import or export).
    Interfaces matching on name from @types/screeps will be merged. This is how you can extend the 'built-in' interfaces from @types/screeps.
  */
  // Memory extension samples
  interface Memory {
    uuid: number;
    log: any;
    economyType?: string;
  }

  interface CreepMemory {
    role: string;
    upgrading?: boolean;
    building?: boolean;
    repairing?: boolean;
    targetSource?: Id<Source>;
    delivering?: boolean;
    carrying?: boolean;
    isArmySquad?: boolean;
    // hitWaypointFlag?: boolean;
    // hitWaypointFlag2?: boolean;
    extensionFarm?: number;
    mainUpgrader?: boolean;
    firstSpawnCoords?: string;
    hasJoinedPatrol?: boolean;
    numberOfNeededHarvestorSlots?: number;
  }

  interface SpawnMemory {
    room: RoomMemory
  }

  interface RoomMemory {
      name: string,
      links?: StructureLink[],
      storages?: StructureStorage[],
      containers?: StructureContainer[],
      spawns: StructureSpawn[],
  }

  interface FlagMemory {
    numberOfNeededHarvestorSlots?: number;
  }

  // Syntax for adding proprties to `global` (ex "global.log")
  namespace NodeJS {
    interface Global {
      log: any;
    }
  }
}



// When compiling TS to JS and bundling with rollup, the line numbers and file names in error messages change
// This utility uses source maps to get the line numbers and file names of the original, TS source code
export const loop = ErrorMapper.wrapLoop(() => {
  //console.log(`Current game tick is ${Game.time}`);

  // Automatically delete memory of missing creeps
  for (const name in Memory.creeps) {
    if (!(name in Game.creeps)) {
      delete Memory.creeps[name];
    }
  }

  transferEnergyToSpawn1Room();
  sendEnergyFromSpawn1();

  AutoSpawn.run();

  for(var room_it in Game.rooms) {
    const room: Room = Game.rooms[room_it]
      var spawn = room.find(FIND_MY_SPAWNS)[0];

      if(!spawn) {
          continue;
      }
      if(!spawn.memory.room) {
        RoomUtils.setSpawnRoom(spawn)
      }

      handleRamparts({ room: room });
      Tower.defendMyRoom(room)

  }




  if(Game?.flags?.rallyFlag?.room) {
      const rallyLocationHasHostiles = Game.flags.rallyFlag.room.find(FIND_HOSTILE_CREEPS, {
          filter:  (ccc) => {
              return ccc.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(ccc.owner)
          }
      })
      const rallyLocationHasHostileStructs = Game.flags.rallyFlag.room.find(FIND_HOSTILE_STRUCTURES, {
          filter:  (ccc) => {
              return ccc.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(ccc.owner) && ccc.structureType !== STRUCTURE_CONTROLLER
          }
      })

      if(rallyLocationHasHostiles?.length || rallyLocationHasHostileStructs?.length){
          SpawnUtils.TOTAL_ATTACKER_SIZE = WarTimeEconomy.TOTAL_ATTACKER_SIZE;
          SpawnUtils.TOTAL_HEALER_SIZE = WarTimeEconomy.TOTAL_HEALER_SIZE;
          SpawnUtils.TOTAL_DISMANTLER_SIZE = WarTimeEconomy.TOTAL_DISMANTLER_SIZE;
          SpawnUtils.TOTAL_MEAT_GRINDERS = WarTimeEconomy.TOTAL_MEAT_GRINDERS;
          Memory.economyType = 'war';
      } else if(Game.flags.seigeFlag) {
          SpawnUtils.TOTAL_ATTACKER_SIZE = SeigeEconomy.TOTAL_ATTACKER_SIZE;
          SpawnUtils.TOTAL_HEALER_SIZE = SeigeEconomy.TOTAL_HEALER_SIZE;
          SpawnUtils.TOTAL_DISMANTLER_SIZE = SeigeEconomy.TOTAL_DISMANTLER_SIZE;
          SpawnUtils.TOTAL_MEAT_GRINDERS = SeigeEconomy.TOTAL_MEAT_GRINDERS;
          Memory.economyType = 'seige';
      } else {
          SpawnUtils.TOTAL_ATTACKER_SIZE = PeaceTimeEconomy.TOTAL_ATTACKER_SIZE;
          SpawnUtils.TOTAL_HEALER_SIZE = PeaceTimeEconomy.TOTAL_HEALER_SIZE;
          SpawnUtils.TOTAL_DISMANTLER_SIZE = PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE;
          SpawnUtils.TOTAL_MEAT_GRINDERS = PeaceTimeEconomy.TOTAL_MEAT_GRINDERS;
          Memory.economyType = 'peace';
      }

  }




  // Creep behavior loop.
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];


    if(creep.memory?.isArmySquad && Memory?.economyType && Game.flags.rallyFlag?.pos &&  creep?.pos &&  Game.flags.stagingFlag &&  !creep.pos.inRangeTo(Game.flags.stagingFlag.pos.x,Game.flags.stagingFlag.pos.y,6)) {
      const totalArmySize =  _.filter(Game.creeps, (creep) => creep.memory.isArmySquad )?.length ?? 0;

      let economyArmySize = 0;
      if(Memory.economyType == 'peace') {
        economyArmySize = PeaceTimeEconomy.TOTAL_ATTACKER_SIZE + PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE + PeaceTimeEconomy.TOTAL_HEALER_SIZE + PeaceTimeEconomy.TOTAL_MEAT_GRINDERS;
      }
      if(Memory.economyType == 'war') {
        economyArmySize = WarTimeEconomy.TOTAL_ATTACKER_SIZE + WarTimeEconomy.TOTAL_DISMANTLER_SIZE + WarTimeEconomy.TOTAL_HEALER_SIZE + WarTimeEconomy.TOTAL_MEAT_GRINDERS;
      }
      if(Memory.economyType == 'seige') {
        economyArmySize = SeigeEconomy.TOTAL_ATTACKER_SIZE + SeigeEconomy.TOTAL_DISMANTLER_SIZE + SeigeEconomy.TOTAL_HEALER_SIZE + SeigeEconomy.TOTAL_MEAT_GRINDERS;
      }
      //console.log(totalArmySize,economyArmySize,Memory.economyType)
      if(totalArmySize < economyArmySize) {
        var hostileCreepsL = creep.room.find(FIND_HOSTILE_CREEPS, {
          filter:  (creep) => {
              return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
          }
        });
        if(Game.flags.stagingFlag && !hostileCreepsL.length) {
          //console.log(Memory.economyType + 'time!')
          creep.moveTo(Game.flags.stagingFlag);
          return;
        }

      }
    }

    if(!creep.memory.firstSpawnCoords) {
        creep.memory.firstSpawnCoords = creep.room.name
    }

    if(creep.memory.role == 'harvester') {
      //MovementUtils.callForHelp(creep);
      Harvester.run(creep);
    }
    if(creep.memory.role == 'carrier') {
      //MovementUtils.callForHelp(creep);
      Carrier.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
      //MovementUtils.callForHelp(creep);
      Upgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
      //MovementUtils.callForHelp(creep);
      Builder.run(creep);
    }
    if(creep.memory.role == 'defender') {
      //MovementUtils.callForHelp(creep);
      Defender.run(creep);
    }
    if(creep.memory.role == 'repairer') {
      //MovementUtils.callForHelp(creep);
      Repairer.run(creep);
    }
    if(creep.memory.role == 'attacker') {
      //ovementUtils.callForHelp(creep)
      Attacker.run(creep);
    }
    if(creep.memory.role == 'settler') {
      //MovementUtils.callForHelp(creep);
      Settler.run(creep);
    }
    if(creep.memory.role == 'scout') {
      //MovementUtils.callForHelp(creep);
      Scout.run(creep);
    }
    if(creep.memory.role == 'claimer' || creep.memory.role === 'attackClaimer') {
      Claimer.run(creep);
    }
    if(creep.memory.role == 'healer') {
      Healer.run(creep);
    }
    if(creep.memory.role == 'dismantler') {
      Dismantler.run(creep);
    }
    if(creep.memory.role == 'meatGrinder') {
      MeatGrinder.run(creep);
    }
    if(creep.memory.role == 'miner') {

      Miner.run(creep);
    }
    MovementUtils.callForHelp(creep);


}
});

