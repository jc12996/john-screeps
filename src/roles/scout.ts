import { MovementUtils } from "utils/MovementUtils";
import { Defender } from "./defender";
import { SpawnUtils } from "utils/SpawnUtils";

export class Scout {

    public static run(creep: Creep): void {


<<<<<<< HEAD
        creep.say('👀',true);
=======
        creep.say('👀');
>>>>>>> 8bb1623 (updates)
        MovementUtils.defaultArmyMovement(creep,Game.flags.rallyFlag);


    }

}

