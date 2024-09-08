import { SpawnUtils } from "utils/SpawnUtils";

export function placeSourceLinks(creep: Creep) {

    const totalNumberOfLinkSites = creep.room.find(FIND_CONSTRUCTION_SITES,{
        filter: (struc: { structureType: string; }) => {
            return struc.structureType === STRUCTURE_LINK
        }
    });

    const sourceLink1FlagTemp = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name == creep.room.name+'SourceLink1'
        }
    })


    if (creep?.room?.controller?.level && creep?.room?.controller?.level == 5  && totalNumberOfLinkSites.length == 1 && !sourceLink1FlagTemp[0]) {
        if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink1');
        } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
            creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink1');
        }

    }

    if(creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
        const sourceLink2FlagTemp = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink2'
            }
        })
        if (!sourceLink2FlagTemp.length) {
            if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink2');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink2');
            }

        }
    }

    if(creep?.room?.controller?.level && creep?.room?.controller?.level == 8) {
        const sourceLink3FlagTemp = creep.room.find(FIND_FLAGS, {
            filter: (site) => {
                return site.name == creep.room.name+'SourceLink3'
            }
        })
        if (!sourceLink3FlagTemp.length) {

            if(creep.room?.createConstructionSite(creep.pos.x -1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x -1,creep.pos.y,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x +1,creep.pos.y,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x +1,creep.pos.y,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y +1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y +1,creep.room.name+'SourceLink3');
            } else if(creep.room?.createConstructionSite(creep.pos.x,creep.pos.y -1,STRUCTURE_LINK) == OK){
                creep.room.createFlag(creep.pos.x,creep.pos.y -1,creep.room.name+'SourceLink3');
            }

        }
    }
}

export function manageLinks(creep: Creep | StructureSpawn) {

    var container = creep.pos.findClosestByRange(FIND_STRUCTURES, {
        filter:  (structure) => {
            return (
                structure.structureType == STRUCTURE_CONTAINER

            ) &&
                structure.store.getFreeCapacity(RESOURCE_ENERGY) > 0;
        }
    });

    const sourceLink1Flag = creep.room.find(FIND_FLAGS, {
        filter: (site) => {
            return site.name == creep.room.name+'SourceLink1'
        }
    })


    const activeSources = creep.room.find(FIND_SOURCES_ACTIVE);

    const xCreepCapacityCreeps = creep.room.find(FIND_MY_CREEPS, {
        filter: (creep) => creep.memory.extensionFarm1
    })

    let xCapacity = 800;

    if(xCreepCapacityCreeps.length) {
        const xCreepCapacity = xCreepCapacityCreeps[0].store.getCapacity();
        if(xCreepCapacity > 0) {
            xCapacity = xCreepCapacity
        }
    }
    if(xCapacity > 800) {
        xCapacity = 800;
    }

    const filledSourceLink1: AnyStructure | null = creep.room.find(FIND_STRUCTURES,{
        filter: (struc) => {
            return (
                sourceLink1Flag[0] &&
                sourceLink1Flag[0].pos &&
                struc.pos.x == sourceLink1Flag[0].pos.x &&
                struc.pos.y == sourceLink1Flag[0].pos.y &&
                struc.structureType === STRUCTURE_LINK &&
                (struc.store[RESOURCE_ENERGY] >= xCapacity || (activeSources.length == 0 && struc.store[RESOURCE_ENERGY] >= 100))

        )}
    })[0] ?? null



        const extensionLink = getLinkByTag(creep, 'ExtensionLink');
        const extensionLink2 = getLinkByTag(creep,'ExtensionLink2');
        const controllerLink = getLinkByTag(creep,'ControllerLink1');
        const hostileCreeps = creep.pos.findClosestByPath(FIND_HOSTILE_CREEPS, {
            filter:  (creep) => {
                return creep.owner && !SpawnUtils.FRIENDLY_OWNERS_FILTER(creep.owner)
            }
        });
        const minimumStorageThreshold = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store[RESOURCE_ENERGY] > 800;
            }
        });

        const largeStorage = creep.pos.findClosestByPath(FIND_STRUCTURES, {
            filter:  (structure) => {
                return (
                   structure.structureType == STRUCTURE_STORAGE && structure.room?.controller?.my


                ) &&
                    structure.store[RESOURCE_ENERGY] > 200000;
            }
        });



            if(filledSourceLink1 && filledSourceLink1.structureType === STRUCTURE_LINK) {
                creep.room?.createConstructionSite(filledSourceLink1.pos.x,filledSourceLink1.pos.y,STRUCTURE_RAMPART)

                if(controllerLink) {
                    creep.room?.createConstructionSite(controllerLink.pos.x,controllerLink.pos.y,STRUCTURE_RAMPART);
                }
            }


            if(largeStorage && creep.room.controller && creep.room.controller.my && creep.room.controller.level == 7 ) {

                // SOURCE -> EXTENSION 1 -> [EXTENSION 2, CONTROLLER]
                if(extensionLink2 && filledSourceLink1 &&  filledSourceLink1.structureType === STRUCTURE_LINK) {
                    filledSourceLink1.transferEnergy(extensionLink2);
                }

                if(controllerLink) {
                    extensionLink.transferEnergy(controllerLink);
                }


                return;
            }


            if(!filledSourceLink1 || filledSourceLink1.structureType !== STRUCTURE_LINK) {
                return;
            }

            // SOURCE -> CONTROLLER (IF Storage is above 800) -> EXTENSION 1 -> EXTENSION 2
            let transfer1 = null;
            if(!hostileCreeps && controllerLink && minimumStorageThreshold  && creep.room.controller && creep.room.controller?.level == 7) {
                transfer1 = filledSourceLink1.transferEnergy(controllerLink);
            }


            if(transfer1 !== OK) {
                let transfer2  =  filledSourceLink1.transferEnergy(extensionLink2);


                if(transfer2 !== OK) {
                    filledSourceLink1.transferEnergy(extensionLink);
                }
            }


}

export function getLinkByTag(creep: Creep | StructureSpawn, linkTag: string): StructureLink {
    const linkFlag= creep.room.find(FIND_FLAGS, {
        filter: (link) => {

            return link.name == creep.room.name+linkTag
        }
    })[0] ?? null;

    const links: Array<StructureLink> = creep.room.find(FIND_MY_STRUCTURES,{
        filter: (struc) => {

            return linkFlag && struc && struc.structureType === STRUCTURE_LINK && struc.pos.x == linkFlag.pos.x && struc.pos.y == linkFlag.pos.y
        }
    });
    return links[0];

}
