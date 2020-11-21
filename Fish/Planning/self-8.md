## Self-Evaluation Form for Milestone 8

Indicate below where your TAs can find the following elements in your strategy and/or player-interface modules:

1. did you organize the main function/method for the manager around
   the 3 parts of its specifications --- point to the main function

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish/Admin/src/manager/manager.ts#L65-L93

We did organize the main function around its pieces of functionality. First it alerts the players the tournament is starting, then it runs the tournament
(we should have factored this out), and then it alerts players if they won or lost

2. did you factor out a function/method for informing players about
   the beginning and the end of the tournament? Does this function catch
   players that fail to communicate? --- point to the respective pieces

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish/Admin/src/manager/manager.ts#L120-L167

There are our functions that alert the player when the tournament starts and is over. The helper notifyCompetitorOrMakeFailure, kicks out a player if they do not communicate correctly

3. did you factor out the main loop for running the (possibly 10s of
   thousands of) games until the tournament is over? --- point to this
   function.

We did not, but we did factor our the running of each round into:
https://github.ccs.neu.edu/CS4500-F20/levelland/blob/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish/Admin/src/manager/manager.ts#L110-L118

Which handles the splitting into groups:

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish/Admin/src/manager/manager.ts#L291-L330

and running the games:

https://github.ccs.neu.edu/CS4500-F20/levelland/blob/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish/Admin/src/manager/manager.ts#L183-L259

**Please use GitHub perma-links to the range of lines in specific
file or a collection of files for each of the above bullet points.**

WARNING: all perma-links must point to your commit "84cea04e45bb1db82338a01328cf82abbdea4cfe".
Any bad links will be penalized.
Here is an example link:
<https://github.ccs.neu.edu/CS4500-F20/levelland/tree/84cea04e45bb1db82338a01328cf82abbdea4cfe/Fish>
