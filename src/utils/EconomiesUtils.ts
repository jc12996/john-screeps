export enum EconomiesUtils {
    Harvester = 2,// Per Source
    Carrier = 2.5,// Per Source
    Upgrader = 1,// Per Source
    Builder = 1,// Per Source
    Repairer = 1,// Per Source
    Defender = 0,// Per Source
    Claimers = 0,
    Settlers = 0
}

export enum SeigeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 3,
    TOTAL_HEALER_SIZE = 9,
    TOTAL_DISMANTLER_SIZE = 6,
    TOTAL_MEAT_GRINDERS = 3

}

export enum WarTimeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 9,
    TOTAL_HEALER_SIZE = 6,
    TOTAL_DISMANTLER_SIZE = 0,
    TOTAL_MEAT_GRINDERS = 0

}

export enum PeaceTimeEconomy {
    //ARMY Economy
    TOTAL_ATTACKER_SIZE = 4,
    TOTAL_HEALER_SIZE = 3,
    TOTAL_DISMANTLER_SIZE = 0,
    TOTAL_MEAT_GRINDERS = 0

}
