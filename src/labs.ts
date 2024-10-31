export enum LabMapper {
    K = 0,
    ZK = 1,
    U = 2,
    UL = 3,
    Z = 4,
    GH = 5,
    UH = 6,
    L  = 7,
    U2 = 8,
    H = 9,
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

    const UH_lab = labs[LabMapper.UH] ?? null;

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
            return structure.structureType === STRUCTURE_LAB
        }
    }) as StructureLab[];


    const UH_lab = labs[LabMapper.UH] ?? null;

    if(labs.length === 0){
      boost.creep.memory.isBoosted = true;
      return true;
    }




    let numberOfAttackParts = boost.creep.getActiveBodyparts(ATTACK);
    const attackBoostCap = 3;
    if(numberOfAttackParts > 0) {

        if(!UH_lab) {
          boost.creep.memory.isBoosted = true;
          return true;
        }
        let numberOfBoosts = 0;
        while(numberOfAttackParts > 0 && numberOfBoosts < attackBoostCap) {
          const boostCode = UH_lab.boostCreep(boost.creep,numberOfAttackParts);
          if(boostCode === ERR_NOT_IN_RANGE) {
            boost.creep.moveTo(UH_lab);
            return false;
          }else if(boostCode === OK) {
            numberOfBoosts++;
            continue;
          } else  {
            numberOfAttackParts--;
          }
        }

    }

    boost.creep.memory.isBoosted = true;
    return true;

  }
}
