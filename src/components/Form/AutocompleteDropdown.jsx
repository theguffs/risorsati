import { useState, useEffect, useRef } from 'react'
import './AutocompleteDropdown.css'

export const AutocompleteDropdown = ({
  value,
  onChange,
  onSelect,
  options = [],
  placeholder = '',
  label = '',
  displayKey = 'nome',
  getValueKey = (item) => item[displayKey],
  renderOption = null,
  showHint = false,
  hintText = '',
  searchOnFocus = true,
  required = false,
  onFocus = null,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [filteredOptions, setFilteredOptions] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const containerRef = useRef(null)
  const inputRef = useRef(null)

  // Inizializza le opzioni quando cambiano o quando si apre
  useEffect(() => {
    if (isOpen) {
      if (searchQuery) {
        // Se c'è una ricerca, filtra
        const filtered = options.filter(opt => {
          const displayValue = getValueKey(opt).toLowerCase()
          return displayValue.includes(searchQuery.toLowerCase())
        })
        setFilteredOptions(filtered)
      } else {
        // Se il campo è vuoto, mostra tutte le opzioni
        setFilteredOptions(options)
      }
    }
  }, [options, isOpen, searchQuery, getValueKey])

  // Aggiorna il valore di ricerca quando cambia il valore esterno
  useEffect(() => {
    if (!isOpen) {
      setSearchQuery(value || '')
    }
  }, [value, isOpen])

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false)
        // Se non c'è un valore selezionato e si chiude, mantieni quello che è stato scritto
        // Non resettare il searchQuery, così l'utente può scrivere liberamente
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleInputChange = (e) => {
    const newValue = e.target.value
    setSearchQuery(newValue)
    onChange(newValue)
    
    // Apri sempre il dropdown quando si scrive
    if (!isOpen) {
      setIsOpen(true)
    }
    
    // Filtra le opzioni in tempo reale
    if (newValue) {
      // Se c'è testo, filtra
      const filtered = options.filter(opt => {
        const displayValue = getValueKey(opt).toLowerCase()
        return displayValue.includes(newValue.toLowerCase())
      })
      setFilteredOptions(filtered)
    } else {
      // Se il campo è vuoto, mostra tutte le opzioni
      setFilteredOptions(options)
    }
  }

  const handleSelect = (option) => {
    const selectedValue = getValueKey(option)
    setSearchQuery(selectedValue)
    onChange(selectedValue)
    if (onSelect) {
      onSelect(option)
    }
    setIsOpen(false)
    // Non fare blur, così l'utente può continuare a modificare se vuole
  }

  const handleInputFocus = () => {
    setIsOpen(true)
    
    // Chiama la callback onFocus se fornita (per caricare tutte le opzioni)
    if (onFocus) {
      onFocus()
    }
    
    // Mostra sempre tutte le opzioni quando si mette il focus, anche se il campo è vuoto
    if (options.length > 0) {
      if (searchQuery) {
        // Se c'è una ricerca, filtra
        const filtered = options.filter(opt => {
          const displayValue = getValueKey(opt).toLowerCase()
          return displayValue.includes(searchQuery.toLowerCase())
        })
        setFilteredOptions(filtered)
      } else {
        // Se il campo è vuoto, mostra tutte le opzioni
        setFilteredOptions(options)
      }
    }
  }

  const handleInputClick = () => {
    setIsOpen(true)
    // Mostra sempre tutte le opzioni quando si clicca, anche se il campo è vuoto
    if (options.length > 0) {
      if (searchQuery) {
        // Se c'è una ricerca, filtra
        const filtered = options.filter(opt => {
          const displayValue = getValueKey(opt).toLowerCase()
          return displayValue.includes(searchQuery.toLowerCase())
        })
        setFilteredOptions(filtered)
      } else {
        // Se il campo è vuoto, mostra tutte le opzioni
        setFilteredOptions(options)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
      inputRef.current?.blur()
    } else if (e.key === 'Enter' && isOpen && filteredOptions.length > 0) {
      // Seleziona la prima opzione filtrata
      e.preventDefault()
      handleSelect(filteredOptions[0])
    }
  }

  return (
    <div className="autocomplete-dropdown" ref={containerRef}>
      {label && <label>{label}</label>}
      <div className="autocomplete-input-wrapper">
        <input
          ref={inputRef}
          type="text"
          value={isOpen ? searchQuery : (value || '')}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onClick={handleInputClick}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="autocomplete-input"
          autoComplete="off"
          required={required}
        />
        <span className="autocomplete-arrow">▼</span>
        {isOpen && (
          <div className="autocomplete-dropdown-list">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option, index) => {
                const displayValue = getValueKey(option)
                const isSelected = value === displayValue
                return (
                  <div
                    key={option.id || index}
                    className={`autocomplete-dropdown-item ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleSelect(option)}
                  >
                    {renderOption ? renderOption(option) : displayValue}
                  </div>
                )
              })
            ) : (
              <div className="autocomplete-dropdown-item no-results">
                Nessun risultato trovato
              </div>
            )}
          </div>
        )}
      </div>
      {showHint && hintText && (
        <span className="form-hint">{hintText}</span>
      )}
    </div>
  )
}

