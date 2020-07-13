from itertools import islice

data_path = "./data/results/"
filtered_data_path = "./data/filtered_results/"

def find_valid_lines_step1_and_step4(filename, finished_user_ids):
    user_id_count = 0
    execution_times = {}
    valid_lines = []
    headline = ""
    with open(data_path + filename, "r") as f:
        headline = f.readline().strip()
        for line in f:
            splitted_line = line.strip().split(",")
            user_id = splitted_line[0]
            elapsed_time = splitted_line[3]
            if user_id in finished_user_ids:
                if user_id in execution_times:
                    execution_times[user_id] += int(elapsed_time)
                else:
                    execution_times[user_id] = int(elapsed_time)
                    user_id_count += 1
                if execution_times[user_id] <= 120000:
                    valid_lines.append(line.strip())

    return headline, valid_lines

def find_valid_lines_step2_and_step3(filename, finished_user_ids):
    user_id_count = 0
    number_of_domains = {}
    valid_lines = []
    headline = ""
    with open(data_path + filename, "r") as f:
        headline = f.readline().strip()
        for line in f:
            splitted_line = line.strip().split(",")
            user_id = splitted_line[0]
            if user_id in finished_user_ids:
                if user_id in number_of_domains:
                    number_of_domains[user_id] += 1
                else:
                    number_of_domains[user_id] = 1
                    user_id_count += 1
                if number_of_domains[user_id] <= 10:
                    valid_lines.append(line.strip())

    return headline, valid_lines

def find_valid_lines_test_persons(filename, finished_user_ids):
    valid_lines = []
    headline = ""
    with open(data_path + filename, "r") as f:
        headline = f.readline().strip()
        for line in f:
            splitted_line = line.strip().split(",")
            user_id = splitted_line[0]
            if user_id in finished_user_ids:
                valid_lines.append(line.strip())

    return headline, valid_lines

def save_to_csv(filename, headline, valid_lines):
    with open(filtered_data_path + filename, "w+") as f:
        f.write(headline + "\n")
        f.write("\n".join(valid_lines))

# get user_ids which finished all four steps
finished_user_ids = set()
with open(data_path + "test_persons.csv", "r") as f:
    for line in islice(f, 1, None):
        splitted_line = line.strip().split(",")
        user_id = splitted_line[0]
        finished_step1 = splitted_line[6] == "1"
        finished_step2 = splitted_line[7] == "1"
        finished_step3 = splitted_line[8] == "1"
        finished_step4 = splitted_line[9] == "1"
        finished_questionnaire = splitted_line[10] == "1"
        if finished_step1 and finished_step2 and finished_step3 and finished_step4 and finished_questionnaire:
            finished_user_ids.add(user_id)
print("Number of user_ids which finished all four steps: " + str(len(finished_user_ids)))

headline, valid_lines_test_persons = find_valid_lines_test_persons("test_persons.csv", finished_user_ids)
save_to_csv("test_persons.csv", headline, valid_lines_test_persons)
headline, valid_lines_step1 = find_valid_lines_step1_and_step4("step1.csv", finished_user_ids)
save_to_csv("step1.csv", headline, valid_lines_step1)
headline, valid_lines_step2 = find_valid_lines_step2_and_step3("step2.csv", finished_user_ids)
save_to_csv("step2.csv", headline, valid_lines_step2)
headline, valid_lines_step3 = find_valid_lines_step2_and_step3("step3.csv", finished_user_ids)
save_to_csv("step3.csv", headline, valid_lines_step3)
headline, valid_lines_step4 = find_valid_lines_step1_and_step4("step4.csv", finished_user_ids)
save_to_csv("step4.csv", headline, valid_lines_step4)