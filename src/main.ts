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
  }

  interface CreepMemory {
    role: string;
    room?: string;
    working?: boolean;
    upgrading?: boolean;
    building?: boolean;
    repairing?: boolean;
    targetSource?: Id<Source>;
    delivering?: boolean;
    carrying?: boolean;
    carryIndex?: number;
    friendRampartEntered?: boolean;
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

  AutoSpawn.run();

  for(var room_it in Game.rooms) {
      var room = Game.rooms[room_it]
      var spawn = room.find(FIND_MY_SPAWNS)[0];
      if(!spawn) {
          continue;
      }
      Tower.defendMyRoom(room_it)
  }


  // Creep behavior loop.
  for(var name in Game.creeps) {
    var creep = Game.creeps[name];
    if(creep.memory.role == 'harvester') {
      Harvester.run(creep);
    }
    if(creep.memory.role == 'carrier') {
      Carrier.run(creep);
    }
    if(creep.memory.role == 'upgrader') {
      Upgrader.run(creep);
    }
    if(creep.memory.role == 'builder') {
      Builder.run(creep);
    }
    if(creep.memory.role == 'defender') {
      Defender.run(creep);
    }
    if(creep.memory.role == 'repairer') {
      Repairer.run(creep);
    }
    if(creep.memory.role == 'attacker') {
      Attacker.run(creep);
    }
    if(creep.memory.role == 'settler' || creep.memory.role == 'settlerUpgrader') {
      Settler.run(creep);
    }
    if(creep.memory.role == 'claimer') {
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
}
});

