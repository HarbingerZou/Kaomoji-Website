// kaomoji.mjs
export class Kaomoji{
	constructor(value, emotions){
		this.value = value;
		this.emotions = emotions;
	}
	isemotion(emotion){
		return emotions.includes(emotion);
	}
}