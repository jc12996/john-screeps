import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";

export class Scout {

    public static run(creep: Creep): void {


        creep.say('👀');
        MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);


    }

}
