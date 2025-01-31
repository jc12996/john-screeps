import { ErrorMapper } from "utils/ErrorMapper";
import { AutoSpawn } from "autospawn";
import { FlagUtils } from "utils/FlagUtils";
import { RoomUtils } from "utils/RoomUtils";
import { CreepUtils } from "utils/CreepUtils";

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
    leadHealer?: boolean;
    extractorMiner?: boolean;
    isBoosted?: boolean;
    hauling?: boolean;
    assignedMineFlag?: string;
    targetContainerPath?: PathStep[];
    targetContainerId?: Id<StructureContainer>;
    targetContainer?: StructureContainer;
    settled?: boolean;
    scoutCheckpointNumber?: number;
  }

  interface FlagMemory {
    numberOfNeededHarvestorSlots?: number;
    isassigned?: boolean;
    numberOfNeededMiners?: number;
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

  if(!Game.spawns && Game.creeps) {
    FlagUtils.run();
    CreepUtils.run();
    return;
  }


  AutoSpawn.run();

  FlagUtils.run();

  RoomUtils.run();

  CreepUtils.run();
});
