import { SpawnUtils } from "utils/SpawnUtils";
import { RoomUtils } from "utils/RoomUtils";
import { ScaffoldingUtils } from "utils/ScaffoldingUtils";
import { HighUpkeep, LowUpkeep, MediumUpkeep, PeaceTimeEconomy, SeigeEconomy, WarTimeEconomy } from "utils/EconomiesUtils";
import { operateLinks, sendEnergyFromSpawn1, transferEnergyToSpawn1Room } from "links";
import { getNextClaimFlag } from "claims";


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
        let bodyParts = null;
        let name = null;
        let options = undefined;

        const defenders = _.filter(Game.creeps, (creep) => creep.memory.role == 'defender' && (Game.flags.draftFlag || (creep.room.name == spawn.room.name)));
        const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawn.room.name);
        const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn.room.name);
        const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == spawn.room.name);
        const repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == spawn.room.name);
        const attackers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attacker');
        const scouts = _.filter(Game.creeps, (creep) => creep.memory.role == 'scout');
        const meatGrinders = _.filter(Game.creeps, (creep) => creep.memory.role == 'meatGrinder');
        const settlers = _.filter(Game.creeps, (creep) => creep.memory.role == 'settler');
        const claimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'claimer');
        const attackClaimers = _.filter(Game.creeps, (creep) => creep.memory.role == 'attackClaimer');
        const healers = _.filter(Game.creeps, (creep) => creep.memory.role == 'healer');

        const mineFlag = Game.flags[spawn.room.name+'MineFlag'];
        const mineHostiles = mineFlag?.room?.find(FIND_HOSTILE_CREEPS).length;
        const miners = _.filter(Game.creeps, (creep) => {
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

        //if(spawn.room.name == 'W3N9') {
         //    spawn.room.memory.numberOfNeededHarvestorSlots = 12
        // }
        if(spawn.room.memory?.numberOfNeededHarvestorSlots === undefined || spawn.room.memory.numberOfNeededHarvestorSlots == 0) {
            spawn.room.memory.numberOfNeededHarvestorSlots = RoomUtils.getTotalAmountOfProspectingSlotsInRoomBySpawnOrFlag(spawn);
            console.log(spawn.room.name,'numberOfNeededHarvesters to memory ',spawn.room.memory.numberOfNeededHarvestorSlots)
        }

        if(spawn.room.name === 'W1N6') {
            spawn.room.memory.numberOfNeededHarvestorSlots = 5;
        }

        const numberOfNeededHarvesters = spawn.room.memory?.numberOfNeededHarvestorSlots ?? RoomSources.length;

        const storage  = spawn.room.find(FIND_STRUCTURES, {
            filter: { structureType: STRUCTURE_STORAGE }
        })[0] ?? undefined;
        const extensionFarm2Flag = Game.flags[spawn.room.name+'ExtensionFarm2'];
        var constructionSites = spawn.room.find(FIND_CONSTRUCTION_SITES);
        const extensions  = spawn.room.find(FIND_MY_STRUCTURES, {
            filter: { structureType: STRUCTURE_EXTENSION }
        });
        const nonactiveharvesters = harvesters.filter((hhh) => !hhh.memory?.targetSource );


        let numberOfNeededCarriers = LowUpkeep.Carriers * harvesters.length;
        let numberOfNeededBuilders = LowUpkeep.Builder * 1;
        let numberOfNeededRepairers = LowUpkeep.Repairer * 1;
        let numberOfNeededUpgraders = LowUpkeep.Upgrader * RoomSources.length;
        let numberOfNeededMiners = LowUpkeep.Miners * 1;
        let numberOfNeededSettlers = LowUpkeep.Settlers * 1;
        let numberOfNeededDefenders = !!Game.flags.draftFlag ? (LowUpkeep.DraftedDefenderTotal * 1) : (LowUpkeep.Defender * 1);

        this.nextClaimFlag = getNextClaimFlag(spawn.room,extensionFarm2Flag);
        operateLinks(spawn);

        if(commandLevel >= 6 && numberOfNeededCarriers < 2) {
            numberOfNeededCarriers = 2;
        }

        if(commandLevel >= 7 && numberOfNeededCarriers > 4) {
            numberOfNeededCarriers = 4;
        }


        if(storage){
            if(storage.store[RESOURCE_ENERGY] > 50000) {
                numberOfNeededCarriers = MediumUpkeep.Carriers * harvesters.length;
                numberOfNeededUpgraders = MediumUpkeep.Upgrader * RoomSources.length
                numberOfNeededBuilders = MediumUpkeep.Builder * 1
                numberOfNeededRepairers = MediumUpkeep.Repairer * 1
                numberOfNeededDefenders = numberOfNeededDefenders + MediumUpkeep.AdditionalDraftedDefenders;
                numberOfNeededSettlers = MediumUpkeep.Settlers;
                numberOfNeededMiners = MediumUpkeep.Miners;
                //console.log(`Medium Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            } else if(storage.store[RESOURCE_ENERGY] > 400000) {
                numberOfNeededCarriers = HighUpkeep.Carriers * harvesters.length;
                numberOfNeededUpgraders = HighUpkeep.Upgrader * RoomSources.length
                numberOfNeededBuilders = HighUpkeep.Builder * 1
                numberOfNeededRepairers = HighUpkeep.Repairer *  1
                numberOfNeededSettlers = HighUpkeep.Settlers;
                numberOfNeededMiners = HighUpkeep.Miners;
                numberOfNeededDefenders = numberOfNeededDefenders + HighUpkeep.AdditionalDraftedDefenders;
                //console.log(`High Upkeep in ${spawn.name} storage:`,storage.store[RESOURCE_ENERGY],' needed upgraders: ',numberOfNeededUpgraders);
            }
        }

        if(!!mineFlag) {
            const mineSources = mineFlag.room?.find(FIND_SOURCES);

            if(mineFlag.memory?.numberOfNeededHarvestorSlots === undefined || mineFlag.memory.numberOfNeededHarvestorSlots === 0) {
                mineFlag.memory.numberOfNeededHarvestorSlots = RoomUtils.getTotalAmountOfProspectingSlotsInRoomBySpawnOrFlag(mineFlag);
            }


            if(mineSources) {
                numberOfNeededMiners = mineFlag.memory?.numberOfNeededHarvestorSlots ?? RoomSources.length;
            }
            let mineMultiplier = 1.5;
            if(commandLevel >= 6 && spawn.room.energyAvailable >= 1700) {
                mineMultiplier = 1;
            }
            numberOfNeededMiners = numberOfNeededMiners > 0 ? (numberOfNeededMiners * mineMultiplier) : (mineSources?.length??0);

        }

        if(commandLevel >= 7) {
            numberOfNeededDefenders = 0;
            numberOfNeededMiners = numberOfNeededMiners > 2 ? 3:0;
            if(commandLevel === 7){
                numberOfNeededUpgraders = numberOfNeededUpgraders * 1.1;
            }
        }


        if(commandLevel >= 6 && numberOfNeededCarriers >= 8) {
            numberOfNeededCarriers = 8;
        }

        if(commandLevel >= 6 && numberOfNeededUpgraders >= 8) {
            numberOfNeededUpgraders = 8;
        }

        if(commandLevel >= 8) {
            numberOfNeededUpgraders = 1;
        }

        if(commandLevel >= 8 && Game.flags.draftFlag) {
            numberOfNeededDefenders = numberOfNeededDefenders + LowUpkeep.TOTALDRAFT
        }

        const totalNumberOfControlledRooms =  _.filter(Game.rooms, (room) => room.controller?.my).length;

        var hostileCreeps = spawn.room.find(FIND_HOSTILE_CREEPS);

        let isSquadPatrol = commandLevel >= 7 && Game.flags.rallyFlag;

        const mineFlags = _.filter(Game.flags, (flag) => flag.room && flag.name && flag.name.includes('MineFlag') && !flag.room?.controller?.my);

        if(Game.flags.startScouting && isSquadPatrol) {
            isSquadPatrol = Game.flags.scoutFlag || Game.flags.attackFlag;
        }
        if(hostileCreeps.length == 0 && claimers.length < LowUpkeep.Claimers
            &&  !!this.nextClaimFlag
            && totalNumberOfControlledRooms < Game.gcl.level
            && !this.nextClaimFlag.room?.controller?.my
            && !this.nextClaimFlag.room?.controller?.owner
        )  {
            name = 'Claimer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('claimer',spawn, commandLevel, 0);
            options = {memory: {role: 'claimer'}};

        }
        else if (commandLevel >= 7 && energyAvailable > 2000 && miners.length > 0 && attackClaimers.length < mineFlags.length) {
             name = 'AttackClaimer' + Game.time;
             bodyParts = SpawnUtils.getBodyPartsForArchetype('attackClaimer',spawn, commandLevel, 0);
             options = {memory: {role: 'attackClaimer'}};

        }
        else if(hostileCreeps.length == 0 && settlers.length < LowUpkeep.Settlers
            && ((
                !!this.nextClaimFlag
                && this.nextClaimFlag.room?.controller?.my &&
                 this.nextClaimFlag.room.find(FIND_HOSTILE_CREEPS).length == 0
            ) || Game.flags.settlerFlag)
        )  {
            name = 'Settler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('settler',spawn, commandLevel, 0);
            options = {memory: {role: 'settler'}};
        }
         else if ((harvesters.length == 0 || (harvesters.length == 1 && harvesters[0].ticksToLive && harvesters[0].ticksToLive <= 100)) && nonactiveharvesters.length == 0) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel,2)
            options = {memory: {role: 'harvester'}}
        }
        else if (carriers.length == 0 || (carriers.length == 1 && carriers[0].ticksToLive && carriers[0].ticksToLive <= 100)) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel,0)
            options = {memory: {role: 'carrier'}}
        }
        else if(numberOfNeededHarvesters > 0 && harvesters.length < (numberOfNeededHarvesters) && ActiveRoomSources.length > 0) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel,numberOfNeededHarvesters)
            options = {memory: {role: 'harvester'}}
        }
        else if(spawn.room.energyCapacityAvailable > 250 && hostileCreeps.length == 0 && carriers.length >= 2 && (upgraders.length < 3)) {
            name = 'Upgrader' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('upgrader',spawn,commandLevel,numberOfNeededUpgraders)
            options = {memory: {role: 'upgrader'}                }
        }
        else if (!spawn.spawning && numberOfNeededCarriers > 0 && carriers.length < (numberOfNeededCarriers) && ActiveRoomSources.length > 0) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel,numberOfNeededCarriers)
            options = {memory: {role: 'carrier'}}

        }
        else if ((hostileCreeps.length == 0) && spawn.room.controller.level >= 2 && constructionSites.length && numberOfNeededBuilders > 0 && builders.length < (numberOfNeededBuilders) && RoomSources.length > 0) {
            name = 'Builder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('builder',spawn,commandLevel,numberOfNeededBuilders)
            options = {memory: {role: 'builder'}}
        }
        else if(Game.flags.startScouting && commandLevel >= 7 && Game.flags.rallyFlag2 && !Game.flags.scoutFlag && scouts.length < PeaceTimeEconomy.TOTAL_SCOUT_SIZE)  {
            name = 'Scout' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('scout',spawn, commandLevel, 0);
            options = {memory: {role: 'scout', isArmySquad:true}};
        }
        else if ((defenders.length < numberOfNeededDefenders ||(Game.flags.draftFlag && defenders.length < LowUpkeep.TOTALDRAFT))) {
            name = 'Defender' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('defender',spawn,commandLevel,0);
            options = {memory: {role: 'defender'}};
        }
        else if(isSquadPatrol && attackers.length < SpawnUtils.TOTAL_ATTACKER_SIZE)  {
            name = 'Attacker' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('attacker',spawn, commandLevel, 0);
            options = {memory: {role: 'attacker', isArmySquad:true}};
        }
        else if(isSquadPatrol && !Game.flags.rallyFlag2 && dismantlers.length < SpawnUtils.TOTAL_DISMANTLER_SIZE)  {
            name = 'Dismantler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('dismantler',spawn, commandLevel, 0);
            options = {memory: {role: 'dismantler', isArmySquad:true}};
        }
        else if(isSquadPatrol && !Game.flags.rallyFlag2 && healers.length < SpawnUtils.TOTAL_HEALER_SIZE)  {
            name = 'Healer' + Game.time;
            if(healers.length == 0) {
                name = 'LeadHealer';
            }
            bodyParts = SpawnUtils.getBodyPartsForArchetype('healer',spawn, commandLevel, 0);
            options = {memory: {role: 'healer', isArmySquad:true}};
        } else if (isSquadPatrol && !Game.flags.rallyFlag2 && meatGrinders.length < SpawnUtils.TOTAL_MEAT_GRINDERS) {
            name = 'MeatGrinder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('meatGrinder',spawn, commandLevel, 0);
            options = {memory: {role: 'meatGrinder', isArmySquad:true}};
        }
        else if (!!mineFlag && miners.length < numberOfNeededMiners) {
            name = 'Miner' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('miner',spawn,commandLevel,0);
            options = {memory: {role: 'miner'}};
        }
        else if(repairableStuff.length && numberOfNeededRepairers > 0 && repairers.length < (numberOfNeededRepairers) && ActiveRoomSources.length > 0) {

            name = 'Repairer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('repairer',spawn,commandLevel,numberOfNeededRepairers)
            options = {memory: {role: 'repairer'}            }
        }
        else if(spawn.room.energyAvailable > 400  && (hostileCreeps.length == 0) && (spawn.room.controller.level < 2 || extensions.length >= 4) && (upgraders.length < numberOfNeededUpgraders  || upgraders.length == 0)) {
            name = 'Upgrader' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('upgrader',spawn,commandLevel,numberOfNeededUpgraders)
            options = {memory: {role: 'upgrader'}                }
        }

















        if(spawn && spawn.spawning) {

            var spawningCreep = Game.creeps[spawn.spawning.name];
            if(SpawnUtils.SHOW_VISUAL_CREEP_ICONS) {
                console.log(spawn.name + ' spawning new creep: ' + spawningCreep.name);
            }
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});

            if(spawn.room.controller && spawn.room.controller.my && !!spawn) {
                ScaffoldingUtils.createExtensionFarm1(spawn);
                if(spawn.room.controller.level >= 5 && !!extensionFarm2Flag) {


                    ScaffoldingUtils.createExtensionFarm2(spawn,AutoSpawn.totalSpawns,extensionFarm2Flag);
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
