import { ScaffoldingUtils } from "utils/ScaffoldingUtils";

export function getNextClaimFlag(room:Room,extensionFarm2Flag:Flag): Flag | undefined {
    for (let i = 0; i < 10; i++) {
        const claimFlag = Game.flags['claimFlag'+i];
        if (claimFlag){
            const claimRoom = claimFlag.room;


            if(room === claimRoom && claimRoom?.name){
                new RoomVisual(claimRoom.name).line(claimFlag.pos.x,claimFlag.pos.y,claimFlag.pos.x-6,claimFlag.pos.y);
                new RoomVisual(claimRoom.name).line(claimFlag.pos.x-6,claimFlag.pos.y,claimFlag.pos.x-6,claimFlag.pos.y+6);
                new RoomVisual(claimRoom.name).line(claimFlag.pos.x,claimFlag.pos.y,claimFlag.pos.x,claimFlag.pos.y+6);
                new RoomVisual(claimRoom.name).line(claimFlag.pos.x,claimFlag.pos.y+6,claimFlag.pos.x-6,claimFlag.pos.y+6);
                if(extensionFarm2Flag && room === extensionFarm2Flag.room){
                    new RoomVisual(claimRoom.name).line(extensionFarm2Flag.pos.x,extensionFarm2Flag.pos.y,extensionFarm2Flag.pos.x-6,extensionFarm2Flag.pos.y);
                    new RoomVisual(claimRoom.name).line(extensionFarm2Flag.pos.x-6,extensionFarm2Flag.pos.y,extensionFarm2Flag.pos.x-6,extensionFarm2Flag.pos.y+6);
                    new RoomVisual(claimRoom.name).line(extensionFarm2Flag.pos.x,extensionFarm2Flag.pos.y,extensionFarm2Flag.pos.x,extensionFarm2Flag.pos.y+6);
                    new RoomVisual(claimRoom.name).line(extensionFarm2Flag.pos.x,extensionFarm2Flag.pos.y+6,extensionFarm2Flag.pos.x-6,extensionFarm2Flag.pos.y+6);
                }


            }

            const roomSpawn = claimRoom?.find(FIND_MY_SPAWNS);
            if(roomSpawn?.length && claimRoom?.controller && claimRoom?.controller.owner) {
                continue;
            }

            return claimFlag;
        }
    }

    return undefined

}
