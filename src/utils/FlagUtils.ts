import { ScaffoldingUtils } from "./ScaffoldingUtils";

// Visual claim stuff
export class FlagUtils {


  public static run() {
    for (var flag in Game.flags) {
        if(flag.startsWith('claimFlag')) {
          const claimFlag = Game.flags[flag];
          if(claimFlag && claimFlag.room) {
            if (claimFlag.room.controller && claimFlag.room.controller.my && !!claimFlag) {
              const extensionFarm2Flag = claimFlag.room.find(FIND_FLAGS,{
                filter: (fff:any) => fff.color === COLOR_PURPLE
              })[0]?? null
              const labFarmFlag = Game.flags[claimFlag.room.name + "LabFarm"];
              const room = Game.rooms[claimFlag.room.name];
              const mySpawn = room.find(FIND_MY_SPAWNS)[0] ?? null;
              if(mySpawn) {

                if(Game.time % 7) {
                  if (claimFlag.room.controller.level >= 5 && !!extensionFarm2Flag) {
                    ScaffoldingUtils.createExtensionFarm2(mySpawn, extensionFarm2Flag);
                  }

                  if (claimFlag.room.controller.level >= 6 && !!labFarmFlag) {
                    ScaffoldingUtils.createLabFarm(mySpawn, labFarmFlag);
                  }

                  if (claimFlag.room.controller.level >= 5 && !!extensionFarm2Flag) {
                    ScaffoldingUtils.createExtensionFarm1(mySpawn);
                  }
                }

                if(extensionFarm2Flag){

                  ScaffoldingUtils.visualizeExtensionPlacement(extensionFarm2Flag); // Visualize where extensions will be placed

                }
              }

            }
            ScaffoldingUtils.visualizeExtensionPlacement(claimFlag); // Visualize where extensions will be placed

          }
        }


      }
  }

}
