# tcg player

## known issues
* card pool uploader has not had asynchrony handled properly. so, for now, you `add to pool`, wait 3 or 4 seconds for all the Ajax requests to complete, then hit `log fetched cards`
* the columns in the pool view build from bottom up
