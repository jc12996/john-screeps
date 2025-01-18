import { ScaffoldingUtils } from "./ScaffoldingUtils";

// Visual claim stuff
export class FlagUtils {


  public static run() {
    for (var flag in Game.flags) {
        if(flag.startsWith('claimFlag')) {
          const claimFlag = Game.flags[flag];
          if(claimFlag && claimFlag.room) {
            if (claimFlag.room.controller && claimFlag.room.controller.my && !!claimFlag) {
              const extensionFarm2Flags = claimFlag.room.find(FIND_FLAGS,{
                filter: (fff:any) => fff.color === COLOR_PURPLE
              });
              const labFarmFlag = claimFlag.room.find(FIND_FLAGS,{
                filter: (fff:any) => fff.color === COLOR_BROWN
              })[0]?? null;
              const room = Game.rooms[claimFlag.room.name];
              const mySpawn = room.find(FIND_MY_SPAWNS)[0] ?? null;
              if(mySpawn) {

                if(Game.time % 7) {
                  if(extensionFarm2Flags) {
                    let extensionFarmNumber = 1;
                    for(const extensionFarm2Flag of extensionFarm2Flags) {

                      if (claimFlag.room.controller.level >= 5 && !!extensionFarm2Flag) {
                        ScaffoldingUtils.createExtensionFarm2(mySpawn, extensionFarm2Flag);
                      }
                      ScaffoldingUtils.visualizeExtensionPlacement(extensionFarm2Flag,extensionFarmNumber > 1); // Visualize where extensions will be placed
                      extensionFarmNumber++;
                    }

                  }


                  if (claimFlag.room.controller.level >= 5 && mySpawn) {
                    ScaffoldingUtils.createExtensionFarm1(mySpawn);
                  }

                  if(labFarmFlag){

                    ScaffoldingUtils.visualizeExtensionPlacement(labFarmFlag); // Visualize where extensions will be placed

                  }
                }




              }

            }
            ScaffoldingUtils.visualizeExtensionPlacement(claimFlag); // Visualize where extensions will be placed

          }
        }


      }
  }

}
