<template>
    <div class="m-search">
        <input type="search" name="query" id="search-notes"
            title="Press forward slash (/) to start typing"
            placeholder="Search"
            v-bind:value="searchQuery"
            v-on:keyup="search">
    </div>
</template>

<script>
export default {
    props: ["searchQuery"],
    methods: {
        search (ev) {
            var searchBarEl = document.querySelector('#search-notes')
            var searchQuery = searchBarEl.value

            if (!this.isValidKey(ev.keyCode)) {
                return
            }

            if (searchQuery) {
                this.$emit('search', searchQuery)
            }
        },
        isValidKey (keyCode) {
            var valid = 
                (keyCode > 47 && keyCode < 58)   || // number keys
                keyCode == 32 || keyCode == 13   || // spacebar & return key(s) (if you want to allow carriage returns)
                (keyCode > 64 && keyCode < 91)   || // letter keys
                (keyCode > 95 && keyCode < 112)  || // numpad keys
                (keyCode > 185 && keyCode < 193) || // ;=,-./` (in order)
                (keyCode > 218 && keyCode < 223);   // [\]' (in order)

            return valid
        }
    }
}
</script>

<style lang="scss">
@import './scss/_theme.scss';

.m-search{
    margin-top: 15px;
    text-align: center;

    @media (min-width: 768px) {
        margin-top: 5px;
    }
}
#search-notes {
    margin: 0 15px;
    border: 1px solid $search-bar-border-color;
    padding: 4px 13px;
    width: calc(100% - 30px);
    line-height: 1.4em;
    background-color: $search-bar-bg-color;
    border-radius: 17px;
    outline: none;

    &:focus {
        border-color: $search-bar-focused-border-color;
        background-color: $search-bar-focused-bg-color;
    }
}
</style>
