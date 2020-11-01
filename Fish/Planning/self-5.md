## Self-Evaluation Form for Milestone 5

Under each of the following elements below, indicate below where your
TAs can find:

-   the data definition, including interpretation, of penguin placements for setups

    -   [action.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Common/src/models/action/action.ts#L11) (L11-L14)
    -   [see also action.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Common/src/models/action/action.ts#L38) (L38-L45)

-   the data definition, including interpretation, of penguin movements for turns
    -   [action.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Common/src/models/action/action.ts#L11) (L11-L14)
    -   [see also](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Common/src/models/action/action.ts#L50) (L50-L73)

*   the unit tests for the penguin placement strategy

    -   [strategy.test.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Player/src/strategy/strategy.test.ts#L100) (L99-L146)

*   the unit tests for the penguin movement strategy;
    given that the exploration depth is a parameter `N`, there should be at least two unit tests for different depths

    -   [strategy.test.ts](https://github.ccs.neu.edu/CS4500-F20/sunnyvale/blob/1397e6afeda688c8c2f67ef629fa5ec51c2343b3/Fish/Player/src/strategy/strategy.test.ts#L164) (L164-L270)

*   any game-tree functionality you had to add to create the `xtest` test harness:
    -   where the functionality is defined in `game-tree.PP`
        -   We did not need to add any additional functionality to create this test harness, the existing methods were enough to build the harness
    -   where the functionality is used in `xtree`
        -   See Above
    -   you may wish to submit a `git-diff` for `game-tree` and any auxiliary modules

**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**

WARNING: all perma-links must point to your commit "e19c0d87682c463a0fc0970c00e8e9b7a10581ce".
Any bad links will result in a zero score for this self-evaluation.
Here is an example link:
<https://github.ccs.neu.edu/CS4500-F20/sunnyvale/tree/e19c0d87682c463a0fc0970c00e8e9b7a10581ce/Fish>
