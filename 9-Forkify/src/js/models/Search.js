import axios from 'axios';

export default class Search {
	constructor(query) {
		this.query = query;
	}

	async getResults() {
		const key = '62d3beb73da112a817d9561b7c399944'

		try {
			const res = await axios(`https://www.food2fork.com/api/search?key=${key}&q=${this.query}`);
			this.results = res.data.recipes;
			console.log(this.results);
		} catch (error) {
			alert(error);
		}
	}
}
