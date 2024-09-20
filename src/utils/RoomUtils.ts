
export class RoomUtils {

    public static setSpawnRoom(spawn: StructureSpawn): void {

        const storages:StructureStorage[] = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => { return (
                structure.structureType == STRUCTURE_STORAGE && structure.store[RESOURCE_ENERGY] > 0); }
        }) ?? undefined;


        const links:StructureLink[] = spawn.room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    structure.structureType === STRUCTURE_LINK


                )
            }
        });

        const spawns:StructureSpawn[] = spawn.room.find(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                    (structure.structureType == STRUCTURE_SPAWN) && structure.room?.controller?.my


                ) &&
                    structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
            }
        }) ?? undefined;


        const containers: StructureContainer[] = spawn.room.find(FIND_STRUCTURES, {
            filter: (structure) => { return (structure.structureType == STRUCTURE_CONTAINER && structure.store[RESOURCE_ENERGY] > 50) && structure.room?.controller?.my; }
        });

        const room = {
            name: spawn.room.name,
            links: links,
            storages: storages,
            containers: containers,
            spawns: spawns
        }

        spawn.memory.room = room


    }

    public static getRoomBySpawn(spawn:StructureSpawn): RoomMemory {
        return spawn.memory.room
    }

    public static getCreepProspectingSlots(source: Source): Array<{
        x: number,
        y: number,
        numberOfPlainSlots: number
    }> {
        const top = { x: source.pos.x, y: source.pos.y + 1, numberOfPlainSlots: 0 };
        const topLeft = { x: source.pos.x -1 , y: source.pos.y + 1, numberOfPlainSlots: 0 };
        const topRight = { x: source.pos.x +1 , y: source.pos.y + 1, numberOfPlainSlots: 0 };
        const right = { x: source.pos.x +1 , y: source.pos.y, numberOfPlainSlots: 0 };
        const left = { x: source.pos.x +1 , y: source.pos.y, numberOfPlainSlots: 0 };
        const bottom = { x: source.pos.x , y: source.pos.y -1, numberOfPlainSlots: 0 };
        const bottomLeft = { x: source.pos.x-1 , y: source.pos.y -1, numberOfPlainSlots: 0 };
        const bottomRight = { x: source.pos.x+1 , y: source.pos.y -1, numberOfPlainSlots: 0 };

        const squareAreas = [top,topLeft,topRight,right,left,bottom,bottomLeft,bottomRight];

        for(const area of squareAreas) {
            const areaPostion: Terrain[] = source.room.lookForAt(LOOK_TERRAIN,area.x,area.y);
            const hasCreep = source.room.lookForAt(LOOK_CREEPS,area.x,area.y);
            if((areaPostion.includes('plain') || areaPostion.includes('swamp')) && hasCreep.length == 0) {
                area.numberOfPlainSlots++;
            }
        }

        return squareAreas.filter((area) => area.numberOfPlainSlots > 0);
    }

    public static getTotalAmountOfProspectingSlotsInRoomBySpawnOrFlag(target: StructureSpawn | Flag): number {

        if(!target || target === undefined || !target.room || target?.room === undefined) {
            return 0;
        }

        let room = target.room;

        const sources = room.find(FIND_SOURCES);


        let total = 0;

        for(const source of sources) {
            const prospectingAreas = this.getCreepProspectingSlots(source)
            for(const area of prospectingAreas) {
                if(area.numberOfPlainSlots > 0) {
                    total = total + area.numberOfPlainSlots;
                }
            }
        }



        return total;

    }

}
