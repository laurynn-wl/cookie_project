import privacy_tip_data from "../data/privacyTipData";

export const get_random_tip = () => {
    if (!privacy_tip_data || privacy_tip_data === 0){
        return {title: 'Error', text: 'No tips avaialable.'};
    }
        const tip_index = Math.floor(Math.random() * privacy_tip_data.length);
        return privacy_tip_data[tip_index];
  
}
