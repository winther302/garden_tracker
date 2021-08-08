import pandas as pd

def import_data():
    vegs_data = pd.read_csv("vegs.csv")
    entries_data = pd.read_csv("entries.csv")
    vegs_data['rotation_rule'] = pd.to_numeric(vegs_data['rotation_rule'])
    return vegs_data, entries_data

def get_basic_info(name,data):
    return data[data['name'].str.contains(name)].reset_index(drop= True).copy()

def check_rotation(name,cur_year, vegs_data, entries_data):
    veg_info = get_basic_info(name,vegs_data)
    entries = get_basic_info(name,entries_data)

    entries['year_left']= entries['year'].values + veg_info.head(1)["rotation_rule"][0]  - cur_year
    result = entries.where(entries['year_left'] >= 0).dropna(how='all')
    #return result['bed'].reset_index(drop=True)
    return result[['bed', 'year']]

def init_check(vegs_data, entries_data):
    crop = input("Which crop do you want to check? ")
    try:
        result = check_rotation(crop,2021,vegs_data, entries_data)
        print("You cannot plant " + crop + " in the following beds.")
        print(result)
        print("\nBasic info for " + crop + ".")
        print(get_basic_info(crop,vegs_data))
        return 1
    except KeyError:
        print("Not a known crop")
        print("Try one of these:")
        print(vegs_data['name'])
        return 0

def main():
    vegs_data, entries_data = import_data()
    init_check(vegs_data, entries_data)
    #print(check_rotation("potatoes",2021,vegs_data, entries_data))
    #print(check_rotation("cabbage", 2021,vegs_data, entries_data))

if __name__ == "__main__":
    main()
