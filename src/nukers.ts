export class Nukers {

    public static awaitingNuke(room:Room) {
        if(Game.time % 7) {
            const realNuke = room.find(FIND_STRUCTURES, {
                filter: (nuke) => {
                    return nuke.structureType === STRUCTURE_NUKER && nuke.store.energy === 300000 && nuke.store[RESOURCE_GHODIUM] === 5000
                }
            })[0] as StructureNuker ?? null;

            if(realNuke && !Game.flags.nukeThis) {
                console.log(room.name + ' NUKER ARMED!!!! Awaiting `nukeThis` flag...')
            }

            if(Game.flags.nukeThis){
                const coordinatePosName = Game.flags.nukeThis.pos
                console.log('Nuke Targeting -->',coordinatePosName)
            }
            if(!realNuke && Game.flags.nukeThis) {
                console.log(room.name + ' NUKER not yet armed!!!!')
            }

            if(!Game.flags.nukeThis || !realNuke || !Game.flags.nukeThis?.pos) {
                return;
            }

            console.log('Ghodium: ', realNuke?.store[RESOURCE_GHODIUM] ?? 0)
            console.log('Energy: ', realNuke?.store[RESOURCE_ENERGY] ?? 0)

            const nukeSent = realNuke.launchNuke(Game.flags.nukeThis.pos)
            if(nukeSent === OK) {
                let sending = 0
                while(sending < 100) {
                    console.log('BOMBS AWAY --- SENDING!!!!!!!!!')
                    sending++;
                }
                Game.flags.nukeThis.remove();
            } else {
                let error = 0
                while(error < 100) {
                    console.log('FAILED SENDING NUKE -- CODE: ', nukeSent)

                    error++;
                }
            }
        }


    }
}
