export enum LabMapper {
    K = 0,
    ZK = 1,
    U = 2,
    UL = 3,
    Z = 4,
    GH = 5,
    K2 = 6,
    L  = 7,
    U2 = 8,
    H = 9,
  }

export class Labs {
  public static runLabs(room:Room) {

    const labs: StructureLab[] = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
          return structure.structureType === STRUCTURE_LAB
      }
  }) as StructureLab[];

    const H_lab = labs[LabMapper.H] ?? null

    const ZK_lab = labs[LabMapper.ZK] ?? null
    const LU_lab = labs[LabMapper.UL] ?? null
    const GH_lab = labs[LabMapper.GH] ?? null

    const L_lab = labs[LabMapper.L] ?? null;
    const U_lab = labs[LabMapper.U] ?? null;


    const Z_lab = labs[LabMapper.Z] ?? null;
    const K_lab = labs[LabMapper.K] ?? null;

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
