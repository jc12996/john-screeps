import { SpawnUtils } from "utils/SpawnUtils";
import { EconomiesUtils } from "utils/EconomiesUtils";


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
        const RoomSources = spawn.room.find(FIND_SOURCES);
        const commandLevel =  spawn.room?.controller?.level ?? 1;
        const energyAvailable = spawn.room.energyAvailable;
        let lowestBodyPartCreep: Creep | undefined = undefined;

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
        lowestBodyPartCreep = _.find(harvesters, (creep) => creep.room.energyAvailable >= 1300 && harvesters.length == (EconomiesUtils.Harvester * RoomSources.length) && creep.getActiveBodyparts(WORK) < 3);
        if(!lowestBodyPartCreep) {
            lowestBodyPartCreep = _.find(carriers, (creep) => creep.room.energyAvailable >= 1300 && carriers.length == (EconomiesUtils.Carrier * RoomSources.length) && creep.getActiveBodyparts(CARRY) < 3);
        }
        // if(!lowestBodyPartCreep) {
        //     lowestBodyPartCreep = _.find(builders, (creep) => creep.room.energyAvailable >= 1300 && builders.length == (EconomiesUtils.Builder * RoomSources.length) && creep.getActiveBodyparts(WORK) < 3);
        // }
        // if(!lowestBodyPartCreep) {
        //     lowestBodyPartCreep = _.find(repairers, (creep) => creep.room.energyAvailable >= 1300 && repairers.length == (EconomiesUtils.Repairer * RoomSources.length) && creep.getActiveBodyparts(WORK) < 3);
        // }
        // if(!lowestBodyPartCreep) {
        //     lowestBodyPartCreep = _.find(upgraders, (creep) => creep.room.energyAvailable >= 1300 && upgraders.length == (EconomiesUtils.Upgrader * RoomSources.length) && creep.getActiveBodyparts(WORK) < 3);
        // }


        // console.log(`${spawn.name} weakest creep:`,lowestBodyPartCreep);
        if(energyAvailable >= 1300 && lowestBodyPartCreep && !spawn.spawning && spawn.room.energyAvailable >= 1300) {
                console.log(spawn.name + ' suicide: ' + lowestBodyPartCreep.name);
                lowestBodyPartCreep.suicide();
                harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester' && creep.room.name == spawn.room.name);
                carriers = _.filter(Game.creeps, (creep) => creep.memory.role == 'carrier' && creep.room.name == spawn.room.name);
                builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder' && creep.room.name == spawn.room.name);
                upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader' && creep.room.name == spawn.room.name);
                repairers = _.filter(Game.creeps, (creep) => creep.memory.role == 'repairer' && creep.room.name == spawn.room.name);
        }

        //console.log(`${spawn.name} number of sources:`,RoomSources.length);
        if (harvesters.length < 1) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel)
            options = {memory: {role: 'harvester'}}
        } else if (carriers.length < 1) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel)
            options = {memory: {role: 'carrier'}}
        } else if (harvesters.length < (EconomiesUtils.Harvester * RoomSources.length)) {
            name = 'Harvester' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('harvester',spawn,commandLevel)
            options = {memory: {role: 'harvester'}}

        } else if (carriers.length < (EconomiesUtils.Carrier * RoomSources.length)) {
            name = 'Carrier' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('carrier',spawn,commandLevel)
            options = {memory: {role: 'carrier'}}

        } else if(builders.length < (EconomiesUtils.Builder * RoomSources.length)) {
            name = 'Builder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('builder',spawn,commandLevel)
            options = {memory: {role: 'builder'}}

        }
        else if(upgraders.length < (EconomiesUtils.Upgrader * RoomSources.length)) {
            name = 'Upgrader' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('upgrader',spawn,commandLevel)
            options = {memory: {role: 'upgrader'}                }
        }
        else if(repairers.length < (EconomiesUtils.Repairer * RoomSources.length)) {
            name = 'Repairer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('repairer',spawn,commandLevel)
            options = {memory: {role: 'repairer'}            }
        }
        else if(claimers.length < EconomiesUtils.Claimers
            && this.nextClaimFlag
            && !this.nextClaimFlag.room?.controller?.my
        )  {
            name = 'Claimer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('claimer',spawn);
            options = {memory: {role: 'claimer'}};

        }
        else if (defenders.length < (EconomiesUtils.Defender * RoomSources.length)) {
            name = 'Defender' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('defender',spawn,commandLevel);
            options = {memory: {role: 'defender'}};
        }
        else if(settlers.length < EconomiesUtils.Settlers
            && ((
                this.nextClaimFlag
                && this.nextClaimFlag.room?.controller?.my
            ) || Game.flags.settlerFlag)
        )  {
            name = 'Settler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('settler',spawn);
            options = {memory: {role: 'settler'}};
        }
        else if (Game.flags.rallyFlag && meatGrinders.length < EconomiesUtils.TOTAL_MEAT_GRINDERS) {
            name = 'MeatGrinder' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('meatGrinder',spawn);
            options = {memory: {role: 'meatGrinder'}};
        }
        else if(dismantlers.length < EconomiesUtils.TOTAL_DISMANTLER_SIZE && Game.flags.rallyFlag)  {
            name = 'Dismantler' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('dismantler',spawn);
            options = {memory: {role: 'dismantler'}};
        }
        else if(attackers.length < EconomiesUtils.TOTAL_ATTACKER_SIZE && Game.flags.rallyFlag)  {
            name = 'Attacker' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('attacker',spawn);
            options = {memory: {role: 'attacker'}};
        }
        else if(healers.length < EconomiesUtils.TOTAL_HEALER_SIZE && Game.flags.rallyFlag)  {
            name = 'Healer' + Game.time;
            bodyParts = SpawnUtils.getBodyPartsForArchetype('healer',spawn);
            options = {memory: {role: 'healer'}};
        }






        if(spawn && spawn.spawning) {

            var spawningCreep = Game.creeps[spawn.spawning.name];
            //console.log(spawn.name + ' spawning new creep: ' + spawningCreep.name);
            spawn.room.visual.text(
                '🛠️' + spawningCreep.memory.role,
                spawn.pos.x + 1,
                spawn.pos.y,
                {align: 'left', opacity: 0.8});


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
