import { SpawnUtils } from "utils/SpawnUtils";

import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { HighUpkeep, LowUpkeep, MediumUpkeep, PeaceTimeEconomy, SeigeEconomy, WarTimeEconomy } from "utils/EconomiesUtils";
import { loadavg } from "os";
import { manageLinks } from "links";


export class AutoSpawn {

    public static nextClaimFlag: any;
    public static nextSpawnFlag: any;
    public static totalSpawns: number;

    public static run(): void {

        const roomsWithSpawns = _.filter(Game.rooms, (room) => { return room.find(FIND_MY_SPAWNS)?.length > 0 });

        this.totalSpawns = 0;
        roomsWithSpawns.forEach(roomWithSpawn => {
            const spawnsInRoom = roomWithSpawn.find(FIND_MY_SPAWNS);
            if(spawnsInRoom.length > 0) {

                for(const spawn of spawnsInRoom) {
                    this.totalSpawns++;
                    this.spawnSequence(spawn);
                }
            }

        })
    }

    private static spawnSequence(spawn: any): void {

        //console.log("totalSpawns",this.totalSpawns);
        let bodyParts = null;
        let name = null;
        let options = undefined;

        const defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender' && (Game.flags.draftFlag || (creep.room.name == spawn.room.name)));
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawn.room.name);
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn.room.name);
        const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == spawn.room.name);
        const repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == spawn.room.name);
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
        const meatGrinders = _.filter(Game.creeps, (creep) => creep.memory.role == 'meatGrinder');
        const settlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'settler');
        const claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
        const healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
        const miners = _.filter(Game.creeps, (creep) => {


            const mineFlag = Game.flags[spawn.room.name+'MineFlag']

            if(!!!mineFlag) {
                return false;
            }

            const mineFlagRoom = mineFlag.room;

            return creep.memory.role == 'miner' &&
            (
                creep.room.name == spawn.room.name ||
                (
                    mineFlagRoom &&
                    creep.room.name == mineFlagRoom.name
                )
            )

        });
        const dismantlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'dismantler');
        const carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn.room.name);
        const repairableStuff = spawn.room.find(FIND_STRUCTURES, {
            filter: (site: { structureType: string; store: { [x: string]: number; }; }) => { return (
                site.structureType == STRUCTURE_CONTAINER || site.structureType === STRUCTURE_RAMPART || site.structureType === STRUCTURE_ROAD); }
        });

        const RoomSources = spawn.room.find(FIND_SOURCES);
        const ActiveRoomSources = spawn.room.find(FIND_SOURCES_ACTIVE);
        const commandLevel =  spawn.room?.controller?.level ?? 1;
        const energyAvailable = spawn.room.energyAvailable;
        const numberOfNeededHarvesters = RoomUtils.getTotalAmountOfProspectingSlotsInRoomBySpawn(spawn);
        const storage  = spawn.room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_STORAGE }
        })[0] ?? undefined;

        //console.log(spawn.name, numberOfNeededHarvesters)
        for (let i = 0; i < 10; i++) {
            const claimFlag = Game.flags['claimFlag'+i];
            if (claimFlag){
                const claimRoom = claimFlag.room;
                const roomSpawn = claimRoom?.find(FIND_MY_SPAWNS);
                if(roomSpawn?.length) {
                    continue;
                }
                this.nextClaimFlag = claimFlag;
                break;
            }
        }

        manageLinks(spawn);

        //console.log('Next claim flag ',this.nextClaimFlag.name)

        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        const extensions  = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });



        const activeharvesters = harvesters.filter((hhh) => hhh.memory?.targetSource );
        const nonactiveharvesters = harvesters.filter((hhh) => !hhh.memory?.targetSource );
        const numberOfNeededHarvestersMax = LowUpkeep.Harvesters * RoomSources.length;
        let numberOfNeededCarriers = LowUpkeep.Carriers * harvesters.length;
        let numberOfNeededBuilders = LowUpkeep.Builder * RoomSources.length;
        let numberOfNeededRepairers = LowUpkeep.Repairer * RoomSources.length;
        let numberOfNeededUpgraders = LowUpkeep.Upgrader * RoomSources.length;
        let numberOfNeededMiners = LowUpkeep.Miners * 1;
        let numberOfNeededSettlers = LowUpkeep.Settlers * 1;
        let numberOfNeededDefenders = !!Game.flags.draftFlag ? (LowUpkeep.DraftedDefenderTotal * activeharvesters.length) : (LowUpkeep.Defender * activeharvesters.length);





        if(commandLevel >= 6 && numberOfNeededCarriers < 2) {
            numberOfNeededCarriers = 2;
        }

        if(storage){
            if(storage.store[RESOURCE_ENERGY] > 500000) {
                numberOfNeededCarriers = MediumUpkeep.Carriers * harvesters.length;
                numberOfNeededUpgraders = MediumUpkeep.Upgrader * RoomSources.length
                numberOfNeededBuilders = MediumUpkeep.Builder * RoomSources.length
                numberOfNeededRepairers = MediumUpkeep.Repairer * RoomSources.length
                numberOfNeededDefenders = numberOfNeededDefenders + MediumUpkeep.AdditionalDraftedDefenders;
                numberOfNeededSettlers = MediumUpkeep.Settlers;
                numberOfNeededMiners = MediumUpkeep.Miners;
                //console.log(`Medium Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            } else if(storage.store[RESOURCE_ENERGY] > 800000) {
                numberOfNeededCarriers = HighUpkeep.Carriers * harvesters.length;
                numberOfNeededUpgraders = HighUpkeep.Upgrader * RoomSources.length
                numberOfNeededBuilders = HighUpkeep.Builder * RoomSources.length
                numberOfNeededRepairers = HighUpkeep.Repairer *RoomSources.length
                numberOfNeededSettlers = HighUpkeep.Settlers;
                numberOfNeededMiners = HighUpkeep.Miners;
                numberOfNeededDefenders = numberOfNeededDefenders + HighUpkeep.AdditionalDraftedDefenders;
                //console.log(`High Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            }
        }

        //console.log(numberOfNeededSettlers);
        // if(!!Game.flags.settlerFlag && settlers.length >= numberOfNeededSettlers) {
        //     Game.flags.settlerFlag.remove();
        // }



        const totalNumberOfControlledRooms =  _.filter(Game.rooms, (room) => room.controller?.my).length;
        const totalNumberOfTowers = spawn.room.find(FIND_STRUCTURES,{
            filter: (struc: { structureType: string; }) => {
                return struc.structureType === STRUCTURE_TOWER
            }
        });



        //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
        //console.log(`${spawn.name} has rally flag:`,!!Game.flags.rallyFlag);
        if(claimers.length < LowUpkeep.Claimers
            && !!this.nextClaimFlag
            && totalNumberOfControlledRooms < Game.gcl.level
            && !this.nextClaimFlag.room?.controller?.my
            && !this.nextClaimFlag.room?.controller?.owner
        )  {
            name = 'Claimer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('claimer',spawn, commandLevel, 0);
            options = {memory: {role: 'claimer'}};

        } else if(settlers.length < LowUpkeep.Settlers
            && ((
                !!this.nextClaimFlag
                && this.nextClaimFlag.room?.controller?.my
            ) || Game.flags.settlerFlag)
        )  {
            name = 'Settler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('settler',spawn, commandLevel, 0);
            options = {memory: {role: 'settler'}};
        } else if ((harvesters.length == 0 || (harvesters.length == 1 && harvesters[0].ticksToLive && harvesters[0].ticksToLive <= 100)) && nonactiveharvesters.length == 0) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel,2)
            options = {memory: {role: 'harvester'}}
        } else if (!!Game.flags[spawn.room.name+'MineFlag']  && miners.length < numberOfNeededMiners) {
            name = 'Miner' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('miner',spawn,commandLevel,0);
            options = {memory: {role: 'miner'}};
        } else if (carriers.length == 0 || (carriers.length == 1 && carriers[0].ticksToLive && carriers[0].ticksToLive <= 100)) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel,0)
            options = {memory: {role: 'carrier'}}
        } else if (((activeharvesters.length > 0 || harvesters.length == 0) && !spawn.spawning && numberOfNeededHarvesters > 0 && harvesters.length < (numberOfNeededHarvesters + harvesters.length) && ActiveRoomSources.length > 0 && harvesters.length < numberOfNeededHarvestersMax)  && nonactiveharvesters.length == 0) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel,numberOfNeededHarvesters)
            options = {memory: {role: 'harvester'}}
        } else if (!spawn.spawning && numberOfNeededCarriers > 0 && carriers.length < (numberOfNeededCarriers) && ActiveRoomSources.length > 0) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel,numberOfNeededCarriers)
            options = {memory: {role: 'carrier'}}

        } else if (spawn.room.controller.level >= 2 && constructionSites.length && numberOfNeededBuilders > 0 && builders.length < (numberOfNeededBuilders) && RoomSources.length > 0) {
            name = 'Builder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('builder',spawn,commandLevel,numberOfNeededBuilders)
            options = {memory: {role: 'builder'}}
        } else if(totalNumberOfTowers.length == 0 && repairableStuff.length && numberOfNeededRepairers > 0 && repairers.length < (numberOfNeededRepairers) && ActiveRoomSources.length > 0) {
            name = 'Repairer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('repairer',spawn,commandLevel,numberOfNeededRepairers)
            options = {memory: {role: 'repairer'}            }
        } else if((spawn.room.controller.level < 2 || extensions.length >= 4) && upgraders.length < numberOfNeededUpgraders) {
            name = 'Upgrader' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('upgrader',spawn,commandLevel,numberOfNeededUpgraders)
            options = {memory: {role: 'upgrader'}                }
        }
        else if (defenders.length < numberOfNeededDefenders) {
            name = 'Defender' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('defender',spawn,commandLevel,0);
            options = {memory: {role: 'defender'}};
        }
        else if(Game.flags.rallyFlag && attackers.length < SpawnUtils.TOTAL_ATTACKER_SIZE)  {
            name = 'Attacker' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('attacker',spawn, commandLevel, 0);
            options = {memory: {role: 'attacker', isArmySquad:true}};
        }
        else if(Game.flags.rallyFlag && healers.length < SpawnUtils.TOTAL_HEALER_SIZE)  {
            name = 'Healer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('healer',spawn, commandLevel, 0);
            options = {memory: {role: 'healer', isArmySquad:true}};
        }
        else if(Game.flags.rallyFlag && dismantlers.length < SpawnUtils.TOTAL_DISMANTLER_SIZE)  {
            name = 'Dismantler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('dismantler',spawn, commandLevel, 0);
            options = {memory: {role: 'dismantler', isArmySquad:true}};
        } else if (Game.flags.rallyFlag && meatGrinders.length < SpawnUtils.TOTAL_MEAT_GRINDERS) {
            name = 'MeatGrinder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('meatGrinder',spawn, commandLevel, 0);
            options = {memory: {role: 'meatGrinder', isArmySquad:true}};
        }












        if(spawn && spawn.spawning) {

            var spawningCreep = Game.creeps[spawn.spawning.name];
            console.log(spawn.name + ' spawning new creep: ' + spawningCreep.name);
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});

            if(spawn.room.controller && spawn.room.controller.my && !!spawn) {

                ScaffoldingUtils.createRoadX(spawn);

                if(spawn.room.controller.level <= 5 ) {

                    ScaffoldingUtils.createExtensions(spawn,AutoSpawn.totalSpawns);
                    if(!Game.flags[spawn.room.name+'NoWalls']) {
                        ScaffoldingUtils.createBaseWallsAndRamparts(spawn);
                    }
                }

                const extensionFarm2Flag = Game.flags[spawn.room.name+'ExtensionFarm2'];
                if(spawn.room.controller.level >= 6 && !!extensionFarm2Flag) {

                    ScaffoldingUtils.createRoadX(spawn,extensionFarm2Flag);
                    ScaffoldingUtils.createExtensions(spawn,AutoSpawn.totalSpawns,extensionFarm2Flag);
                }
            }
        } else if (bodyParts != null && name != null) {
            let spawnResult = spawn.spawnCreep(bodyParts,name, options);
            if(spawnResult !== 0) {
                let spawnErrorMsg = '';
                switch(spawnResult) {
                    case -6:
                        spawnErrorMsg = 'NOT ENOUGH ENERGY of '+ energyAvailable + ' for ' + bodyParts;
                        break;
                    case -10:
                        spawnErrorMsg = 'ERR_INVALID_ARGS: ' + bodyParts.length
                        break;
                    default:
                        spawnErrorMsg = 'Spawn error' + spawnResult
                        break;
                }
                console.log(`SPAWN ERROR CODE FOR ${spawn.name}`,spawnErrorMsg);
            }
        }
    }
}
