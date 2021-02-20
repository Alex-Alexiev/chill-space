<template>
    <div> 
        <h1>my canvas</h1>
        <canvas ref="canv"></canvas>
        <button @click="drawRect">Add Rect</button>
        <button @click="subWidth">-</button>
        <button @click="addWidth">+</button>
    </div>
</template>

<script>
export default {
    name: 'my-canvas',
    data() {
        return {
            rectWidth: 200,
            width: 0,
            height: 0,
            pose: []
        }
    },
    async mounted () {
        this.ctx = this.$refs.canv.getContext("2d");
    },
    
    methods: {
        drawRect() {
            this.ctx.clearRect(0, 0, 400, 200);
            this.ctx.beginPath();
            this.ctx.rect(20, 20, this.rectWidth, 100);
            this.ctx.stroke();
        },
        addWidth(){
            this.rectWidth += 10
            this.drawRect()
        },
        subWidth() {
            this.rectWidth -= 10
            this.drawRect()
        }

    }
}


</script>

<style></style>