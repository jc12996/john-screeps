import { SpawnUtils } from "utils/SpawnUtils"

export function handleRamparts({ room }: { room: Room}) {
    const ramparts: StructureRampart[] = room.find(FIND_MY_STRUCTURES, {
        filter: (structure) => structure.structureType === STRUCTURE_RAMPART
    })
    for (const rampart of ramparts) {
        const teammates = rampart.pos.findInRange(FIND_HOSTILE_CREEPS,3, {
            filter: (creep) => SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
        });
        const enemies = rampart.pos.findInRange(FIND_HOSTILE_CREEPS,100, {
            filter: (creep) => !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
        });

        if(teammates.length > 0 && enemies.length == 0) {
            rampart.setPublic(true);
        } else {
            rampart.setPublic(false);
        }
    }

}
