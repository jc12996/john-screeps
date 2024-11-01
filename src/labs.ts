export enum LabMapper {
    K = 0,
    ZK = 1,
    U = 2,
    UL = 3,
    Z = 4,
    GH = 5,
    UH = 6,
    L  = 7,
    LH = 8,
    H = 9,
    LO = -1, // NON existant todo,
    O = -1,// NON existant todo,
    GO = -1// Non existant todo

  }

type BoostTypes = 'work' | "attack";

export class Labs {
  public static runLabs(room:Room) {

    const labs: StructureLab[] = room.find(FIND_STRUCTURES, {
      filter: (structure) => {
          return structure.structureType === STRUCTURE_LAB
      }
  }) as StructureLab[];

    const ZK_lab = labs[LabMapper.ZK] ?? null
    const LU_lab = labs[LabMapper.UL] ?? null
    const GH_lab = labs[LabMapper.GH] ?? null

    const L_lab = labs[LabMapper.L] ?? null;
    const U_lab = labs[LabMapper.U] ?? null;
    const Z_lab = labs[LabMapper.Z] ?? null;
    const K_lab = labs[LabMapper.K] ?? null;
    const H_lab = labs[LabMapper.H] ?? null;
    const O_lab = labs[LabMapper.O] ?? null;

    // Boost Labs
    const UH_lab = labs[LabMapper.UH] ?? null;
    const LH_lab = labs[LabMapper.LH] ?? null;
    const LO_lab = labs[LabMapper.LO] ?? null;
    const GO_lab = labs[LabMapper.GO] ?? null;

    if(GH_lab && LU_lab && ZK_lab && LU_lab.store[RESOURCE_GHODIUM] < 3000 && ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] > 300 && LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] > 300) {
        GH_lab.runReaction(ZK_lab,LU_lab)
    }


    if (ZK_lab && K_lab && Z_lab && ZK_lab.store[RESOURCE_ZYNTHIUM_KEANITE] < 3000 && Z_lab.store[RESOURCE_ZYNTHIUM] > 0 && K_lab.store[RESOURCE_KEANIUM] > 0) {
        ZK_lab.runReaction(Z_lab,K_lab)
    }

    if (LU_lab && L_lab && U_lab && LU_lab.store[RESOURCE_UTRIUM_LEMERGITE] < 3000 && L_lab.store[RESOURCE_LEMERGIUM] > 0 && U_lab.store[RESOURCE_UTRIUM] > 0) {
        LU_lab.runReaction(L_lab,U_lab)
    }

    if (UH_lab && U_lab && H_lab && UH_lab.store[RESOURCE_UTRIUM_HYDRIDE] < 3000 && U_lab.store[RESOURCE_UTRIUM] > 0 && H_lab.store[RESOURCE_HYDROGEN] > 0) {
        UH_lab.runReaction(U_lab,H_lab)
    }

    if (LH_lab && L_lab && H_lab && UH_lab.store[RESOURCE_LEMERGIUM_HYDRIDE] < 3000 && L_lab.store[RESOURCE_LEMERGIUM] > 0 && H_lab.store[RESOURCE_HYDROGEN] > 0) {
        UH_lab.runReaction(L_lab,H_lab)
    }

    if (LO_lab && L_lab && O_lab && L_lab.store[RESOURCE_LEMERGIUM_OXIDE] < 3000 && L_lab.store[RESOURCE_LEMERGIUM] > 0 && O_lab.store[RESOURCE_OXYGEN] > 0) {
        LO_lab.runReaction(L_lab,O_lab)
    }

    if (GO_lab && GH_lab && O_lab && GH_lab.store[RESOURCE_GHODIUM_OXIDE] < 3000 && GH_lab.store[RESOURCE_GHODIUM] > 0 && O_lab.store[RESOURCE_OXYGEN] > 0) {
        GO_lab.runReaction(GH_lab,O_lab)
    }


  }

  public static boostCreep(boost: {
    type: BoostTypes,
    creep: Creep
  } | undefined): boolean {



    if(!boost) {
      return true;
    }

    const labs: StructureLab[] = boost.creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
            return structure.structureType === STRUCTURE_LAB && structure.store[RESOURCE_ENERGY] > 0
        }
    }) as StructureLab[];

    // Boost Labs
    const UH_lab = labs[LabMapper.UH] ?? null;
    const LH_lab = labs[LabMapper.LH] ?? null;
    const LO_lab = labs[LabMapper.LO] ?? null;
    const GO_lab = labs[LabMapper.GO] ?? null;

    if(labs.length === 0 || (!UH_lab && !LH_lab)){
      boost.creep.memory.isBoosted = true;
      return true;
    }

    if(boost.creep.getActiveBodyparts(ATTACK) > 0 && UH_lab) {
      if(!boost.creep.pos.isNearTo(UH_lab)) {
        boost.creep.moveTo(UH_lab);
        return false;
      }
      while(UH_lab.boostCreep(boost.creep,1) == OK);
    }

    if(boost.creep.getActiveBodyparts(WORK) > 0 && LH_lab) {
      if(!boost.creep.pos.isNearTo(LH_lab)) {
        boost.creep.moveTo(LH_lab);
        return false;
      }
      while(LH_lab.boostCreep(boost.creep,1) == OK);
    }

    if(boost.creep.getActiveBodyparts(HEAL) > 0 && LO_lab) {
      if(!boost.creep.pos.isNearTo(LO_lab)) {
        boost.creep.moveTo(LO_lab);
        return false;
      }
      while(LO_lab.boostCreep(boost.creep,1) == OK);
    }

    if(boost.creep.getActiveBodyparts(TOUGH) > 0 && GO_lab) {
      if(!boost.creep.pos.isNearTo(GO_lab)) {
        boost.creep.moveTo(GO_lab);
        return false;
      }
      while(GO_lab.boostCreep(boost.creep,1) == OK);
    }


    boost.creep.memory.isBoosted = true;
    return true;

  }
}
