
export class RoomUtils {

    public static getCreepProspectingSlots(target: Source | StructureController): Array<{
        x: number,
        y: number,
        numberOfPlainSlots: number
    }> {

        const pos = target.pos;
        const top = { x: pos.x, y: pos.y + 1, numberOfPlainSlots: 0 };
        const topLeft = { x: pos.x -1 , y: pos.y + 1, numberOfPlainSlots: 0 };
        const topRight = { x: pos.x +1 , y: pos.y + 1, numberOfPlainSlots: 0 };
        const right = { x: pos.x +1 , y: pos.y, numberOfPlainSlots: 0 };
        const left = { x: pos.x +1 , y: pos.y, numberOfPlainSlots: 0 };
        const bottom = { x: pos.x , y: pos.y -1, numberOfPlainSlots: 0 };
        const bottomLeft = { x: pos.x-1 , y: pos.y -1, numberOfPlainSlots: 0 };
        const bottomRight = { x: pos.x+1 , y: pos.y -1, numberOfPlainSlots: 0 };

        const squareAreas = [top,topLeft,topRight,right,left,bottom,bottomLeft,bottomRight];

        for(const area of squareAreas) {
            const areaPostion: Terrain[] = target.room.lookForAt(LOOK_TERRAIN,area.x,area.y);
            const hasCreep = target.room.lookForAt(LOOK_CREEPS,area.x,area.y);
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
