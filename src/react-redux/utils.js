// !!!*** Object.entries(obj) in development stage ***!!!
// Find another way

// Check out method provided by lodash library. There are some that
// might do the job.
export default const traverseVotes = (votes, currentUserId, postId) => {
    for(let vote in votes) {
        if(votes.hasOwnProperty(vote) && typeof(vote) === 'object') {
            const votePropsAndValues = Object.entries(vote)
            // This condition depends on the form of the vote object.
            // Will break if vote object changes.
            if(votePropsAndValues[1][1] === postId && votePropsAndValues[2][1] === currentUserId) {
                return vote
                // and exit loop and function
            }
        }
        // else keep looping 'til votes have been exhausted
        // and return false if this is the case
        return null
    }
}
