export enum LabMapper {
    RESOURCE_KEANIUM = 0,
    RESOURCE_ZK = 1,
    RESOURCE_UTRIUM = 2,
    RESOURCE_UL = 3,
    RESOURCE_ZYNTHIUM = 4,
    RESOURCE_GH = 5,
    RESOURCE_KEANIUM2 = 6,
    RESOURCE_LEMERGIUM  = 7,
    RESOURCE_UTRIUM2 = 8,
    RESOURCE_HYDROGEN = 9,
  }

export class Labs {
  public static runLabs(room:Room) {

    const labs: StructureLab[] = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
          return structure.structureType === STRUCTURE_LAB
      }
  }) as StructureLab[];

    const ZK_lab = labs[LabMapper.RESOURCE_ZK] ?? null
    const LU_lab = labs[LabMapper.RESOURCE_UL] ?? null
    const GH_lab = labs[LabMapper.RESOURCE_GH] ?? null

    const L_lab = labs[LabMapper.RESOURCE_LEMERGIUM] ?? null;
    const U_lab = labs[LabMapper.RESOURCE_UTRIUM] ?? null;


    const Z_lab = labs[LabMapper.RESOURCE_ZYNTHIUM] ?? null;
    const K_lab = labs[LabMapper.RESOURCE_KEANIUM] ?? null;

    if(GH_lab && ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] && LU_lab.store[RESOURCE_UTRIUM_LEMERGITE]) {
        console.log('creating ghodium!')
        GH_lab.runReaction(ZK_lab,LU_lab)
    }


    if (ZK_lab && Z_lab.store[RESOURCE_ZYNTHIUM] && K_lab.store[RESOURCE_KEANIUM]) {
        ZK_lab.runReaction(Z_lab,K_lab)
    }

    if (LU_lab && L_lab.store[RESOURCE_LEMERGIUM] && U_lab.store[RESOURCE_UTRIUM]) {
        LU_lab.runReaction(L_lab,U_lab)
    }
  }
}
