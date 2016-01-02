function Upvote(config) {
	 	this.firebaseRef = new Firebase('https://bandupvote.firebaseio.com');
	 	this.artist = config.artist;
	 	this.artistRef = this.firebaseRef.child(this.artist);
	 	this.songRef = this.firebaseRef.child(this.artist).child("songs");
	 	this.template = config.template;
	 	this.templateContainer = config.templateContainer;
	 	this.songs = [];
	 	this.votes = [];
	 	this.songId = null;
	 	
}

Upvote.prototype.fetch = function (fetchCallback) {
		var self = this;
		this.artistRef.once("value", function(snapshot) {
			var data = snapshot.val();
			for (var i=0;i<data.songs.length;i++) {
				self.songs.push({"id":i,"title":data.songs[i].title,"votes":data.songs[i].votes});
			}	
			if (fetchCallback && (typeof fetchCallback === "function") ) {
				fetchCallback();
			}
		});
};

Upvote.prototype.firebaseListen = function() {
		var self = this;
		this.songRef.on("child_changed", function(snapshot) {
			var voteChanged = snapshot.val();
			self.songs[snapshot.key()].votes = voteChanged.votes;
			$(".votes[data-votes='"+snapshot.key()+"']").html(voteChanged.votes);
		});
};

Upvote.prototype.voteClicked = function( songId ) {
		this.songId = songId;
		this.songs[songId].votes++;
		var thisSongRef = this.songRef.child(songId);
		thisSongRef.update({"votes":this.songs[songId].votes}, function(error) {
			if (error) {
				alert('There was an error adding this vote!');
			}
		});
};

Upvote.prototype.attachTemplate = function(onComplete) {
	var template = Handlebars.compile( this.template );
	var html = template( this.songs );
	this.templateContainer.append( html );
	if (onComplete) onComplete();
};


var upvote = new Upvote({
	template: $('#template').html(),	
	templateContainer: $('#song-list'),
	artist: $("#artist-name").html()
});	


// fetch the data and attach template after data returned 
upvote.fetch(function() {
	upvote.attachTemplate(updateVoteButton);
});


var updateVoteButton = function() {
	$('div.vote-button').on("click",function() { 
		var songId = $(this).data('votes');
		upvote.voteClicked( songId );
	});
};

upvote.firebaseListen();