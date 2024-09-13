
export class RoomUtils {

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

    public static getTotalAmountOfProspectingSlotsInRoomBySpawn(spawn: StructureSpawn): number {

        if(!spawn) {
            return 0;
        }

        const sources = spawn.room.find(FIND_SOURCES);


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
