import { SpawnUtils } from "utils/SpawnUtils";

import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { HighUpkeep, LowUpkeep, MediumUpkeep, PeaceTimeEconomy, SeigeEconomy, WarTimeEconomy } from "utils/EconomiesUtils";


export class AutoSpawn {

    public static nextClaimFlag: any;
    public static nextSpawnFlag: any;
    public static totalSpawns: number;

    public static run(): void {

        this.totalSpawns = _.filter(Game.rooms, (room) => { return room.find(FIND_MY_SPAWNS)?.length > 0 })?.length;

        for(var room_it in Game.rooms) {
            var room = Game.rooms[room_it]
            var spawn = room.find(FIND_MY_SPAWNS)[0];
            if(!spawn) {
                continue;
            }
            this.spawnSequence(spawn);
        }
    }

    private static spawnSequence(spawn: any): void {

        let bodyParts = null;
        let name = null;
        let options = undefined;
        let defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender' && (Game.flags.draftFlag || (creep.room.name == spawn.room.name)));
        let harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawn.room.name);
        let upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn.room.name);
        let builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == spawn.room.name);
        let repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == spawn.room.name);
        let attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
        let meatGrinders = _.filter(Game.creeps, (creep) => creep.memory.role == 'meatGrinder');
        let settlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'settler');
        let claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
        let healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');
        let dismantlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'dismantler');
        let carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn.room.name);
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

        //console.log('Next claim flag ',this.nextClaimFlag.name)

        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        const extensions  = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });


        let TOTAL_ATTACKER_SIZE = 0;
        let TOTAL_HEALER_SIZE = 0;
        let TOTAL_DISMANTLER_SIZE = 0;
        let TOTAL_MEAT_GRINDERS = 0;

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
                TOTAL_ATTACKER_SIZE = WarTimeEconomy.TOTAL_ATTACKER_SIZE;
                TOTAL_HEALER_SIZE = WarTimeEconomy.TOTAL_HEALER_SIZE;
                TOTAL_DISMANTLER_SIZE = WarTimeEconomy.TOTAL_DISMANTLER_SIZE;
                TOTAL_MEAT_GRINDERS = WarTimeEconomy.TOTAL_MEAT_GRINDERS;
                Memory.economyType = 'war';
            } else if(Game.flags.seigeFlag) {
                TOTAL_ATTACKER_SIZE = SeigeEconomy.TOTAL_ATTACKER_SIZE;
                TOTAL_HEALER_SIZE = SeigeEconomy.TOTAL_HEALER_SIZE;
                TOTAL_DISMANTLER_SIZE = SeigeEconomy.TOTAL_DISMANTLER_SIZE;
                TOTAL_MEAT_GRINDERS = SeigeEconomy.TOTAL_MEAT_GRINDERS;
                Memory.economyType = 'seige';
            } else {
                TOTAL_ATTACKER_SIZE = PeaceTimeEconomy.TOTAL_ATTACKER_SIZE;
                TOTAL_HEALER_SIZE = PeaceTimeEconomy.TOTAL_HEALER_SIZE;
                TOTAL_DISMANTLER_SIZE = PeaceTimeEconomy.TOTAL_DISMANTLER_SIZE;
                TOTAL_MEAT_GRINDERS = PeaceTimeEconomy.TOTAL_MEAT_GRINDERS;
                Memory.economyType = 'peace';
            }

        }


        const activeharvesters = harvesters.filter((hhh) => hhh.memory?.targetSource );
        const nonactiveharvesters = harvesters.filter((hhh) => !hhh.memory?.targetSource );
        const numberOfNeededHarvestersMax = LowUpkeep.Harvesters * RoomSources.length;
        let numberOfNeededCarriers = LowUpkeep.Carriers * activeharvesters.length;
        let numberOfNeededBuilders = LowUpkeep.Builder * activeharvesters.length;
        let numberOfNeededRepairers = LowUpkeep.Repairer * activeharvesters.length;
        let numberOfNeededUpgraders = LowUpkeep.Upgrader * activeharvesters.length;
        let numberOfNeededSettlers = LowUpkeep.Settlers * 1;

        if(commandLevel >= 6 && numberOfNeededCarriers < 2) {
            numberOfNeededCarriers = 2;
        }

        if(storage){
            if(storage.store[RESOURCE_ENERGY] > 500000) {
                numberOfNeededCarriers = MediumUpkeep.Carriers * activeharvesters.length;
                numberOfNeededUpgraders = MediumUpkeep.Upgrader * activeharvesters.length
                numberOfNeededBuilders = MediumUpkeep.Builder * activeharvesters.length
                numberOfNeededRepairers = MediumUpkeep.Repairer * activeharvesters.length
                numberOfNeededSettlers = MediumUpkeep.Settlers;
                //console.log(`Medium Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            } else if(storage.store[RESOURCE_ENERGY] > 800000) {
                numberOfNeededCarriers = HighUpkeep.Carriers * activeharvesters.length;
                numberOfNeededUpgraders = HighUpkeep.Upgrader * activeharvesters.length
                numberOfNeededBuilders = HighUpkeep.Builder * activeharvesters.length
                numberOfNeededRepairers = HighUpkeep.Repairer * activeharvesters.length
                numberOfNeededSettlers = HighUpkeep.Settlers;
                //console.log(`High Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            }
        }

        //console.log(numberOfNeededSettlers);
        // if(!!Game.flags.settlerFlag && settlers.length >= numberOfNeededSettlers) {
        //     Game.flags.settlerFlag.remove();
        // }


        const numberOfNeededDefenders = (LowUpkeep.Defender * activeharvesters.length)
        const totalNumberOfControlledRooms =  _.filter(Game.rooms, (room) => room.controller?.my).length;
        const totalNumberOfLinks = spawn.room.find(FIND_STRUCTURES,{
            filter: (struc: { structureType: string; }) => {
                return struc.structureType === STRUCTURE_LINK
            }
        });



        //console.log(`Energy Available in ${spawn.name}:`,energyAvailable);
        //console.log(`${spawn.name} number of sources:`,RoomSources.length);
        if(claimers.length < numberOfNeededSettlers
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

        } else if (spawn.room.controller.level >= 2 && constructionSites.length && !spawn.spawning && numberOfNeededBuilders > 0 && builders.length < (numberOfNeededBuilders) && ActiveRoomSources.length > 0) {
            name = 'Builder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('builder',spawn,commandLevel,numberOfNeededBuilders)
            options = {memory: {role: 'builder'}}
        }
        else if(repairableStuff.length && !spawn.spawning && numberOfNeededRepairers > 0 && repairers.length < (numberOfNeededRepairers) && ActiveRoomSources.length > 0) {
            name = 'Repairer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('repairer',spawn,commandLevel,numberOfNeededRepairers)
            options = {memory: {role: 'repairer'}            }
        }
        else if (defenders.length < numberOfNeededDefenders) {
            name = 'Defender' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('defender',spawn,commandLevel,0);
            options = {memory: {role: 'defender'}};
        }
        else if(Game.flags.rallyFlag && attackers.length < TOTAL_ATTACKER_SIZE)  {
            name = 'Attacker' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('attacker',spawn, commandLevel, 0);
            options = {memory: {role: 'attacker', isArmySquad:true}};
        }
        else if(Game.flags.rallyFlag && healers.length < TOTAL_HEALER_SIZE)  {
            name = 'Healer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('healer',spawn, commandLevel, 0);
            options = {memory: {role: 'healer', isArmySquad:true}};
        }
        else if(Game.flags.rallyFlag && dismantlers.length < TOTAL_DISMANTLER_SIZE)  {
            name = 'Dismantler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('dismantler',spawn, commandLevel, 0);
            options = {memory: {role: 'dismantler', isArmySquad:true}};
        } else if (Game.flags.rallyFlag && meatGrinders.length < TOTAL_MEAT_GRINDERS) {
            name = 'MeatGrinder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('meatGrinder',spawn, commandLevel, 0);
            options = {memory: {role: 'meatGrinder', isArmySquad:true}};
        }
        else if((spawn.room.controller.level < 2 || extensions.length >= 4) && upgraders.length < numberOfNeededUpgraders) {
            name = 'Upgrader' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('upgrader',spawn,commandLevel,numberOfNeededUpgraders)
            options = {memory: {role: 'upgrader'}                }
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

                    if(spawn.room.controller.level <= 5 ) {
                        ScaffoldingUtils.createRoadX(spawn);
                        ScaffoldingUtils.createExtensions(spawn);
                        if(!Game.flags[spawn.room.name+'NoWalls']) {
                            ScaffoldingUtils.createBaseWallsAndRamparts(spawn);
                        }
                    }

                    const extensionFarm2Flag = Game.flags[spawn.room.name+'ExtensionFarm2'];
                    if(spawn.room.controller.level >= 6 && !!extensionFarm2Flag) {

                        ScaffoldingUtils.createRoadX(spawn,extensionFarm2Flag);
                        ScaffoldingUtils.createExtensions(spawn,extensionFarm2Flag);
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
