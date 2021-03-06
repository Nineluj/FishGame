#!/usr/bin/python3

# You need to go into each integration test folder and
# run `make` there to make the executables work
#
# There should be a fest/ folder under {MS_Number}/
# that is the extracted tar -xf file
#
# This script can take numbers (separated by spaces)
# that indicate the milestone testing folders not to be run

import pathlib
import re
import subprocess
import os
import sys
import shlex
import shutil

# Be careful what you set this to, will be deleted when run
OUTDIR = "/tmp/fish/"

skips = set()

# handles skipped MS directories
if len(sys.argv) > 1:
    for arg in sys.argv[1:]:
        skips.add(arg)

# Get the top level dir
root_loc = pathlib.Path(__file__).resolve().parent.parent.parent.parent
all_folders = [x for x in root_loc.glob("*")]

# retrieve the milestones, test fest folders and the executables
milestones = list(filter(lambda f: re.compile(r"^[0-9]+$").match(f.name), all_folders))
milestones.sort(key=lambda m: int(m.name))

test_fests = list(map(lambda d: list(d.glob("fest/")), milestones))
executables = list(map(lambda f: list(f.glob("x*")), milestones))

# retrieve the json equality helper
json_cmd = list(root_loc.glob("**/json-eq/json-eq"))[0]

if os.path.isdir(OUTDIR):
    shutil.rmtree(OUTDIR)

os.mkdir(OUTDIR)

for index, tf_list in enumerate(test_fests):
    name = milestones[index].name

    if name in skips:
        print(f"Skipping {name} as requested")
        continue
    if len(tf_list) != 1:
        print(f"Skipping {name}, no fest folder found")
        continue
    if len(executables[index]) != 1:
        print(f"Skipping {name}, no executable found")
        continue

    exec_path = executables[index][0]

    all_test_files = list(test_fests[index][0].glob("**/*-in.json"))
    test_file_len = len(all_test_files)
    count = 0
    failed_tests = 0

    for input_file_name in all_test_files:
        # read the input
        ps = subprocess.Popen(["cat", str(input_file_name)], stdout=subprocess.PIPE)
        ps.wait()

        test_num = str(input_file_name.name)[0]

        # run the integration test integration executable
        exec_out = subprocess.Popen([str(exec_path)], shell=True, cwd=str(exec_path.parent), stdin=ps.stdout, stdout=subprocess.PIPE)
        exec_out.wait()

        OUTFILE = f"{OUTDIR}/{input_file_name.parent.parent.name}_{name}_{test_num}"
        with open(OUTFILE, "wb+") as outfile:
            outfile.writelines(exec_out.stdout)

        # find what the expected file location is
        expected_file = str([x for x in input_file_name.parent.glob(f"{test_num}-out.json")][0])
        cmp_out = subprocess.Popen([str(json_cmd), expected_file, OUTFILE], cwd=str(json_cmd.parent), stdout=subprocess.PIPE)
        cmp_out.wait()

        if cmp_out.returncode != 0:
            failed_tests += 1
            print(f"==================\nFAILURE: MS {name} {expected_file}")
            [print("     " + x.decode()) for x in cmp_out.stdout.readlines()]

        count += 1
        print(f"STATUS: [{count}/{test_file_len}]")

    print(f"Failed {failed_tests} tests")

print("ALL DONE")
