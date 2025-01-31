import { Hauler } from "roles/hauler";
import { Miner } from "roles/miner";
import { MovementUtils } from "./MovementUtils";
import { MeatGrinder } from "roles/meatGrinder";
import { Dismantler } from "roles/dismantler";
import { Claimer } from "roles/claimer";
import { Scout } from "roles/scout";
import { Settler } from "roles/settler";
import { Repairer } from "roles/repairer";
import { Defender } from "roles/defender";
import { Builder } from "roles/builder";
import { Upgrader } from "roles/upgrader";
import { Carrier } from "roles/carrier";
import { Harvester } from "roles/harvester";
import { Attacker } from "roles/attacker";
import { Healer } from "roles/healer";

export class CreepUtils {

    public static run() {

        this.scoutMovementPlanReport();
        for (var name in Game.creeps) {
            var creep = Game.creeps[name];

            // if(Game.flags.reallocateFlag && creep.memory.firstSpawnCoords === "W3N9" && creep.room.name !== Game.flags.reallocateFlag.room?.name) {
            //   console.log('reallocating...')
            //   creep.say("↔")
            //   creep.moveTo(Game.flags.reallocateFlag);
            //   return;
            // }

            // if (
            //   creep.memory?.isArmySquad &&
            //   Memory?.economyType &&
            //   Game.flags.rallyFlag?.pos &&
            //   creep?.pos &&
            //   Game.flags.stagingFlag &&
            //   !creep.pos.inRangeTo(Game.flags.stagingFlag.pos.x, Game.flags.stagingFlag.pos.y, 6)
            // ) {
            //   const totalArmySize = _.filter(Game.creeps, creep => creep.memory.isArmySquad)?.length ?? 0;

            //   let economyArmySize = 0;
            //   if (Memory.economyType == "peace") {
            //     economyArmySize =
            //       PeaceTimeEconomy.TOTAL_ATTACKER_SIZE +
            //       PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE +
            //       PeaceTimeEconomy.TOTAL_HEALER_SIZE +
            //       PeaceTimeEconomy.TOTAL_MEAT_GRINDERS;
            //   }
            //   if (Memory.economyType == "war") {
            //     economyArmySize =
            //       WarTimeEconomy.TOTAL_ATTACKER_SIZE +
            //       WarTimeEconomy.TOTAL_DISMANTLER_SIZE +
            //       WarTimeEconomy.TOTAL_HEALER_SIZE +
            //       WarTimeEconomy.TOTAL_MEAT_GRINDERS;
            //   }
            //   if (Memory.economyType == "seige") {
            //     economyArmySize =
            //       SeigeEconomy.TOTAL_ATTACKER_SIZE +
            //       SeigeEconomy.TOTAL_DISMANTLER_SIZE +
            //       SeigeEconomy.TOTAL_HEALER_SIZE +
            //       SeigeEconomy.TOTAL_MEAT_GRINDERS;
            //   }
            //   //console.log(totalArmySize,economyArmySize,Memory.economyType)
            //   if (totalArmySize < economyArmySize) {
            //     var hostileCreepsL = creep.room.find(FIND_HOSTILE_CREEPS, {
            //       filter: creep => {
            //         return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner);
            //       }
            //     });
            //     if (Game.flags.stagingFlag && !hostileCreepsL.length) {
            //       //console.log(Memory.economyType + 'time!')
            //       creep.moveTo(Game.flags.stagingFlag);
            //       return;
            //     }
            //   }
            // }

            if (!creep.memory.firstSpawnCoords) {
                creep.memory.firstSpawnCoords = creep.room.name;
            }

            if (creep.memory.role == "healer") {
                Healer.run(creep);
                continue;
            }

            if (creep.memory.role == "attacker") {
                MovementUtils.callForHelp(creep);
                Attacker.run(creep);
                continue;
            }

            if (creep.memory.role == "harvester") {
                Harvester.run(creep);
                continue;
            }
            if (creep.memory.role == "carrier") {
                Carrier.run(creep);
                continue;
            }
            if (creep.memory.role == "upgrader") {
                Upgrader.run(creep);
                continue;
            }
            if (creep.memory.role == "builder") {
                Builder.run(creep);
                continue;
            }
            if (creep.memory.role == "defender") {
                Defender.run(creep);
                continue;
            }
            if (creep.memory.role == "repairer") {
                Repairer.run(creep);
                continue;
            }

            if (creep.memory.role == "settler") {
                Settler.run(creep);
                continue;
            }
            if (creep.memory.role == "scout") {
                MovementUtils.callForHelp(creep);
                Scout.run(creep);
                continue;
            }
            if (creep.memory.role == "claimer" || creep.memory.role === "attackClaimer") {
                Claimer.run(creep);
                continue;
            }

            if (creep.memory.role == "dismantler") {
                Dismantler.run(creep);
                continue;
            }
            if (creep.memory.role == "meatGrinder") {
                MeatGrinder.run(creep);
                continue;
            }



            if (creep.memory.role == "miner") {
                MovementUtils.callForHelp(creep);

                if (creep.getActiveBodyparts(WORK) === 0) {
                Hauler.run(creep);
                continue;
                }

                if (creep.getActiveBodyparts(WORK) > 0) {
                Miner.run(creep);
                continue;
                }
            }

            // // Find the flag and the squad
            // const flag = Game.flags["SquadFlag"];
            // if (!flag) {
            //   if (creep.memory.role == "healer") {
            //     Healer.run(creep);
            //     continue;
            //   }

            //   if (creep.memory.role == "attacker") {
            //     MovementUtils.callForHelp(creep);
            //     Attacker.run(creep);
            //     continue;
            //   }
            // } else if (flag && (creep.memory.role == "attacker" || creep.memory.role == "healer")) {
            //   // Find the lead healer
            //   let healers = _.filter(Game.creeps, creep => creep.memory.role == "healer");
            //   let leadHealers = healers.filter(leadHealer => leadHealer.memory.leadHealer);
            //   if (leadHealers.length === 0 && healers[0]) {
            //     healers[0].memory.leadHealer = true;
            //     healers = _.filter(Game.creeps, creep => creep.memory.role == "healer");
            //     leadHealers = healers.filter(leadHealer => leadHealer.memory.leadHealer);
            //   }
            //   const leadHealer = leadHealers[0] ?? healers[0];
            //   const squad: Creep[] = [];

            //   // Get attackers and healers
            //   for (let name in Game.creeps) {
            //     const creep = Game.creeps[name];
            //     if (creep.memory.role === "attacker" || creep.memory.role === "healer") {
            //       squad.push(creep);
            //     }
            //   }

            //   if (creep === leadHealer) {
            //     creep.say("❤", false);
            //   } else if (creep.memory.role === "attacker") {
            //     creep.say("⚔");
            //   } else if (creep.memory.role === "healer") {
            //     creep.say("🏥", false);
            //   }

            //   // Ensure we have exactly 9 creeps (1 lead healer, 4 attackers, 4 healers)
            //   if (!leadHealer || squad.length < SquadUtils.squadSize) {
            //     creep.moveTo(Game.flags.SquadFlag);
            //     if (creep === leadHealer) {
            //       console.log("Forming squad " + squad.length + "/" + SquadUtils.squadSize);
            //     }
            //   } else {
            //     // Assign the squad to combat, handle breaching or post-breach actions
            //     SquadUtils.assignSquadFormationAndCombat(squad, leadHealer, flag);
            //   }
            // }
        }
    }

    private static scoutMovementPlanReport() {
        const armySquadScoutCreeps = _.filter(Game.creeps, creep => creep.memory.isArmySquad === true && creep.memory.role === 'scout');
        const flag1 = Game.flags['1'];
        const flag2 = Game.flags['2']
        if(armySquadScoutCreeps.length && Game.flags.attackFlag && flag1 && flag2) {
            for(const creep of armySquadScoutCreeps){
                if(creep.room === flag1.room) {
                    if(Game.flags.rallyFlag){
                        Game.flags.rallyFlag.remove();
                    }
                    creep.room.createFlag(flag1.pos,'rallyFlag')


                }

                if(creep.room === flag2.room) {
                    if(Game.flags.rallyFlag2){
                        Game.flags.rallyFlag2.remove();
                    }
                    creep.room.createFlag(flag2.pos,'rallyFlag2')


                }
            }
        }
    }

}
